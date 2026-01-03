import mongoose, { Schema, Document } from 'mongoose';

export interface IArchivedLog extends Document {
  originalId?: mongoose.Types.ObjectId;
  type: string;
  message: string;
  ip?: string;
  meta?: Record<string, any>;
  createdAt: Date;
  archivedAt: Date;
}

const ArchivedSchema = new Schema<IArchivedLog>({
  originalId: { type: Schema.Types.ObjectId, default: null },
  type: { type: String, required: true },
  message: { type: String, required: true },
  ip: { type: String },
  meta: { type: Schema.Types.Mixed },
  archivedAt: { type: Date, default: Date.now }
}, { timestamps: false });

ArchivedSchema.index({ archivedAt: -1 });

export default mongoose.models.ArchivedLog || mongoose.model<IArchivedLog>('ArchivedLog', ArchivedSchema);
