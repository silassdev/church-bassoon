import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Ticket from '@/models/Ticket';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { message } = await req.json();
  await dbConnect();
  const ticket = await Ticket.findById(params.id);
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // authorization: member can reply to own ticket; coordinator can reply to any
  const role = (session as any).user.role;
  const userId = (session as any).user.id;
  if (role === 'member' && String(ticket.user) !== String(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const author = await User.findById(userId).lean();
  ticket.replies.push({ authorId: userId, authorName: author?.name || author?.email || 'User', message, createdAt: new Date() });
  ticket.status = role === 'coordinator' ? 'pending' : ticket.status;
  await ticket.save();

  // create notification for the other party
  const recipient = role === 'member' ? null : ticket.user; // if coordinator replied, notify user; if member replied, notify coordinator(s) -> for now notify admins/coordinators
  if (role === 'coordinator') {
    await Notification.create({ user: ticket.user, actor: userId, title: `Reply on ticket: ${ticket.subject}`, body: message, read: false });
  } else {
    // notify coordinators (simple: create notifications for all coordinators — adjust in prod)
    const coordinators = await User.find({ role: 'coordinator' }).lean();
    for (const c of coordinators) {
      await Notification.create({ user: c._id, actor: userId, title: `New reply on ticket: ${ticket.subject}`, body: message, read: false });
    }
  }

  return NextResponse.json({ ok: true });
}
