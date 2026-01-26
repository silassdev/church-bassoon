import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user?: mongoose.Types.ObjectId | null;
  title: string;
  body?: string;
  url?: string;
  data?: Record<string, any>;
  read?: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  url: { type: String, default: null },
  data: { type: Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

NotificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
