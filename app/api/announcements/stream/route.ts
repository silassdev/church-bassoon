import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Announcement from '@/models/Announcement';
import { AnnounceBroadcaster } from '@/lib/sse';

 export async function GET() {
  await dbConnect();

  const stream = new ReadableStream({
    start(controller) {
      // helper to push SSE formatted event
      function sendEvent(data: string) {
        const payload = `data: ${data}\n\n`;
        controller.enqueue(new TextEncoder().encode(payload));
      }

      // send initial payload: latest active announcements
      (async () => {
        const latest = await Announcement.find({ active: true }).sort({ createdAt: -1 }).limit(50).lean();
        sendEvent(JSON.stringify({ action: 'init', announcements: latest }));
      })().catch(() => { /* ignore */ });

      // define listener
      const listener = (msg: string) => {
        try { sendEvent(msg); } catch (e) { /* ignore */ }
      };

      // register listener
      AnnounceBroadcaster.add(listener);

      // keep the stream alive; we don't close controller here
      // when consumer disconnects we'll get cancel called
      (stream as any).__listener = listener;
    },
    cancel() {
      // when client disconnects, remove listener (we don't have direct access to it here)
      // But we store listener on stream in start; we can't access it from cancel without closure.
      // To ensure cleanup, place the listener removal logic on returned response's body cancel.
    }
  });

  // Build response with proper SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  // The Start function above added listener to AnnounceBroadcaster
  // We need to ensure removal when stream closes. Wrap stream so we can remove.
  // Simpler approach: create a custom stream that captures the listener variable.

  // For reliability, create a controller-based wrapper:
  let controllerRef: ReadableStreamDefaultController<any> | null = null;
  const s = new ReadableStream({
    start(controller) {
      controllerRef = controller;
      // initial send + listener
      (async () => {
        const latest = await Announcement.find({ active: true }).sort({ createdAt: -1 }).limit(50).lean();
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ action: 'init', announcements: latest })}\n\n`));
      })().catch(() => {});
      const l = (msg: string) => {
        controller.enqueue(new TextEncoder().encode(`data: ${msg}\n\n`));
      };
      // store to remove on cancel
      (controller as any).__listener = l;
      AnnounceBroadcaster.add(l);
    },
    cancel() {
      try {
        const l = (controllerRef as any)?.__listener;
        if (l) AnnounceBroadcaster.remove(l);
      } catch (e) {}
    }
  });

  return new Response(s, { headers });
}
