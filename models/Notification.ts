import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  actor?: mongoose.Types.ObjectId | null;
  title: string;
  body?: string;
  url?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actor: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  title: String,
  body: String,
  url: String,
  read: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
