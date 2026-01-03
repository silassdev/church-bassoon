import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentOption extends Document {
  title: string;
  type: 'tithes' | 'offerings' | 'budget' | 'one_tenth' | string;
  amount?: number;
  description?: string;
  tags?: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentOptionSchema = new Schema<IPaymentOption>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  amount: { type: Number, default: null },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.PaymentOption || mongoose.model<IPaymentOption>('PaymentOption', PaymentOptionSchema);
