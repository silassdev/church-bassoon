import mongoose, { Schema, Document } from 'mongoose';
interface IDonation extends Document { name: string; amount: number; active: boolean; createdAt: Date; }
const S = new Schema<IDonation>({ name: String, amount: Number, active: { type: Boolean, default: true }, createdAt: { type: Date, default: Date.now }});
export default mongoose.models.DonationOption || mongoose.model<IDonation>('DonationOption', S);