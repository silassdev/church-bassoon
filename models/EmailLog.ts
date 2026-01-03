import mongoose from 'mongoose';

const EmailLogSchema = new mongoose.Schema({
  to: String,
  template: String,
  payload: Object,
  status: String,
}, { timestamps: true });

export default mongoose.models.EmailLog
  || mongoose.model('EmailLog', EmailLogSchema);
