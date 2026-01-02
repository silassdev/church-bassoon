import mongoose, { Schema, Document } from 'mongoose';

export type PaymentStatus = 'initiated' | 'success' | 'failed' | 'completed';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  currency?: string;
  method?: string;
  status: PaymentStatus;
  providerReference?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  method: { type: String },
  status: { type: String, enum: ['initiated','success','failed','completed'], default: 'initiated' },
  providerReference: String,
  metadata: Schema.Types.Mixed,
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
