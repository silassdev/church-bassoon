import mongoose, { Schema, Document } from 'mongoose';
interface IAnnouncement extends Document { text: string; addedBy: mongoose.Types.ObjectId; addedByName?: string; createdAt: Date; }
const S = new Schema<IAnnouncement>({ text: { type: String, required: true }, addedBy: { type: Schema.Types.ObjectId, ref: 'User' }, addedByName: { type: String }, createdAt: { type: Date, default: Date.now } });
export default mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', S);
