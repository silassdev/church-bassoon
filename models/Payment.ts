import mongoose, { Schema, Document } from 'mongoose';

export type PaymentStatus = 'initiated' | 'coordinator_marked_paid' | 'pending_admin_approval' | 'success' | 'failed' | 'cancelled';

export interface IPayment extends Document {
  user?: mongoose.Types.ObjectId | null;
  guestName?: string | null;
  guestEmail?: string | null;
  optionId?: mongoose.Types.ObjectId | null;
  title: string;
  amount: number;
  currency?: string;
  method?: string;
  status: PaymentStatus;
  providerReference?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  coordinatorApproval?: {
    by?: mongoose.Types.ObjectId | null;
    note?: string;
    at?: Date | null;
  };
  adminApproval?: {
    by?: mongoose.Types.ObjectId | null;
    decision?: 'approved' | 'declined' | null;
    note?: string;
    at?: Date | null;
  };
}

const PaymentSchema = new Schema<IPayment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  guestName: { type: String, default: null },
  guestEmail: { type: String, default: null },
  optionId: { type: Schema.Types.ObjectId, ref: 'PaymentOption', default: null },

  title: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  method: { type: String, default: '' },
  status: { type: String, enum: ['initiated','coordinator_marked_paid','pending_admin_approval','success','failed','cancelled'], default: 'initiated' },
  providerReference: String,
  metadata: Schema.Types.Mixed,

  coordinatorApproval: { by: { type: Schema.Types.ObjectId, ref: 'User', default: null }, note: String, at: Date },
  adminApproval: { by: { type: Schema.Types.ObjectId, ref: 'User', default: null }, decision: String, note: String, at: Date }
}, { timestamps: true });

PaymentSchema.index({ guestEmail: 1 });
PaymentSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
