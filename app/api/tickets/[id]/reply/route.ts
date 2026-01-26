import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Ticket from '@/models/Ticket';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { message } = await req.json();
  await dbConnect();
  const { id } = await params;
  const ticket = await Ticket.findById(id);
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // authorization: member can reply to own ticket; coordinator/admin can reply to any
  const role = (session as any).user.role;
  let userId = (session as any).user.id;

  // Defensive: Ensure userId is a valid MongoDB ObjectId
  const mongoose = (await import('mongoose')).default;
  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    console.warn('[Tickets] Invalid userId in session:', userId);
    // If we are in a reply route, we really need the ID. 
    // The session healing should have handled this, but if not, we might need a lookup
  }

  if (role === 'member' && String(ticket.user) !== String(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!['member', 'coordinator', 'admin'].includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const author = await User.findById(userId).lean() as any;
  ticket.replies.push({ authorId: userId, authorName: author?.name || author?.email || 'User', message, createdAt: new Date() });
  ticket.status = ['coordinator', 'admin'].includes(role) ? 'pending' : ticket.status;
  await ticket.save();

  // create notification for the other party
  if (['coordinator', 'admin'].includes(role)) {
    // coordinator/admin replied -> notify member
    await Notification.create({
      user: ticket.user,
      actor: userId,
      title: `Reply on ticket: ${ticket.subject}`,
      body: message,
      url: `/dashboard/member/tickets?id=${id}`,
      read: false
    });
  } else {
    // member replied -> notify staff
    const staff = await User.find({ role: { $in: ['coordinator', 'admin'] } }).lean();
    for (const s of staff) {
      await Notification.create({
        user: s._id,
        actor: userId,
        title: `New reply on ticket: ${ticket.subject}`,
        body: message,
        url: `/dashboard/coordinator/tickets?q=${id}`,
        read: false
      });
    }
  }

  return NextResponse.json({ ok: true });
}
