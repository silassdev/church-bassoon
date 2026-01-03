import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  text: string;
  addedBy: mongoose.Types.ObjectId;
  addedByName?: string;
  addedByRole?: 'admin' | 'coordinator' | 'member' | string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  text: { type: String, required: true },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  addedByName: { type: String },
  addedByRole: { type: String },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
