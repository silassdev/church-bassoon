import mongoose, { Schema, Document } from 'mongoose';

export type TicketStatus = 'open' | 'pending' | 'closed';

export interface ITicket extends Document {
  user: mongoose.Types.ObjectId;
  coordinator?: mongoose.Types.ObjectId | null;
  subject: string;
  message: string;
  status: TicketStatus;
  replies: { authorId?: mongoose.Types.ObjectId | null; authorName?: string; message: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coordinator: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open','pending','closed'], default: 'open' },
  replies: [{ authorId: { type: Schema.Types.ObjectId, ref: 'User' }, authorName: String, message: String, createdAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);
