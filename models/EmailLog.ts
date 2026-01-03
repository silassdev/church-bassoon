import mongoose, { Schema } from 'mongoose';

const EmailLogSchema = new Schema({
  templateName: { type: String, required: true, index: true },
  to: { type: String, required: true, index: true },
  subject: String,
  html: String,
  text: String,
  vars: Schema.Types.Mixed,
  locale: String,
  status: { type: String, enum: ['queued','sent','failed'], default: 'queued' },
  error: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now, index: true },
  sentAt: Date
});

export default mongoose.models.EmailLog || mongoose.model('EmailLog', EmailLogSchema);
