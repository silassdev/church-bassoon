import mongoose, { Schema, Document } from 'mongoose';
interface IFeedback extends Document { email?: string; message: string; status: string; response?: string; createdAt: Date; }
const S = new Schema<IFeedback>({ email: String, message: String, status: { type: String, default: 'open' }, response: String, createdAt: { type: Date, default: Date.now }});
export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', S);
