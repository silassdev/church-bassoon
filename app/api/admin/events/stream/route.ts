import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Event from '@/models/Event';
import { EventBroadcaster } from '@/lib/sse';

export async function GET() {
  await dbConnect();

  let controllerRef: ReadableStreamDefaultController<any> | null = null;
  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;
      // send initial payload
      (async () => {
        const now = new Date();
        const upcoming = await Event.find({ active: true, endAt: { $gt: now } }).sort({ startAt: 1 }).limit(50).lean();
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ action: 'init', events: upcoming })}\n\n`));
      })().catch(() => {});
      const l = (msg: string) => {
        controller.enqueue(new TextEncoder().encode(`data: ${msg}\n\n`));
      };
      (controller as any).__listener = l;
      EventBroadcaster.add(l);
    },
    cancel() {
      try {
        const l = (controllerRef as any)?.__listener;
        if (l) EventBroadcaster.remove(l);
      } catch (e) {}
    }
  });

  const headers = new Headers({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' });
  return new Response(stream, { headers });
}
