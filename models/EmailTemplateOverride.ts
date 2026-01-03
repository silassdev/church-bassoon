import mongoose, { Schema } from 'mongoose';

const OverrideSchema = new Schema({
  templateName: { type: String, required: true, index: true },
  locale: { type: String, required: true },
  subject: { type: String, default: '' },
  html: { type: String, default: '' },
  text: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

OverrideSchema.index({ templateName: 1, locale: 1 }, { unique: true });

export default mongoose.models.EmailTemplateOverride || mongoose.model('EmailTemplateOverride', OverrideSchema);
