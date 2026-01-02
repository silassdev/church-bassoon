import mongoose, { Schema, Document } from 'mongoose';
interface ISub extends Document { email: string; createdAt: Date; }
const S = new Schema<ISub>({ email: { type: String, required: true, unique: true }, createdAt: { type: Date, default: Date.now }});
export default mongoose.models.Subscriber || mongoose.model<ISub>('Subscriber', S);
