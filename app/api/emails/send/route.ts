import { emailQueue } from '@/queue/email.queue';

export async function POST(req: Request) {
  const body = await req.json();

  await emailQueue.add('send-email', {
    template: body.template,
    payload: body.payload,
  });

  return Response.json({ queued: true });
}
