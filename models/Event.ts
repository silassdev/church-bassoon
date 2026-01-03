import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  location?: string;
  url?: string;
  bannerUrl?: string;
  active: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdByName?: string;
  createdByRole?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  location: { type: String, default: '' },
  url: { type: String, default: '' },
  bannerUrl: { type: String, default: '' },
  active: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String },
  createdByRole: { type: String },
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
