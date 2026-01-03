import mongoose, { Schema, Document } from 'mongoose';

export type LogType = 'view' | 'blocked' | 'payment_success' | 'payment_failed' | 'signup' | 'deletion' | 'info' | 'error';

export interface ILog extends Document {
  type: LogType;
  message: string;
  ip?: string;
  meta?: Record<string, any>;
  createdAt: Date;
}

const LogSchema = new Schema<ILog>({
  type: { type: String, required: true, index: true },
  message: { type: String, required: true },
  ip: { type: String, index: true },
  meta: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } });

// indexes to help queries
LogSchema.index({ createdAt: -1 });
LogSchema.index({ type: 1, createdAt: -1 });

export default mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
