import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  body: string;
  slug: string;
  featureImage?: string;
  tags: string[];
  status: 'draft' | 'published';
  createdBy: mongoose.Types.ObjectId;
  editedBy?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  body: { type: String, required: true },
  featureImage: { type: String, default: ''},
  tags: [{ type: String }],
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  editedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  publishedAt: Date,
}, { timestamps: true });

PostSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
