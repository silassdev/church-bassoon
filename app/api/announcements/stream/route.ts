import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Announcement from '@/models/Announcement';
import { AnnounceBroadcaster } from '@/lib/sse';

export async function GET() {
  await dbConnect();

  // Build SSE stream
  let controllerRef: ReadableStreamDefaultController<any> | null = null;
  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;

      // Send initial payload: latest active announcements
      (async () => {
        const latest = await Announcement.find({ active: true }).sort({ createdAt: -1 }).limit(50).lean();
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ action: 'init', announcements: latest })}\n\n`));
      })().catch(() => { });

      // Create listener function
      const listener = (msg: string) => {
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${msg}\n\n`));
        } catch (e) {
          // Stream might be closed
        }
      };

      // Store listener reference for cleanup
      (controller as any).__listener = listener;

      // Register listener with broadcaster
      AnnounceBroadcaster.add(listener);
    },
    cancel() {
      // Clean up when client disconnects
      try {
        const listener = (controllerRef as any)?.__listener;
        if (listener) AnnounceBroadcaster.remove(listener);
      } catch (e) { }
    }
  });

  // Build response with proper SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  return new Response(stream, { headers });
}
