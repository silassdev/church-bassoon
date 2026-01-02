import mongoose, { Schema, Document } from 'mongoose';

export type Role = 'admin' | 'coordinator' | 'member';
export type Status = 'unverified' | 'pending' | 'active';

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  name?: string;
  role: Role;
  status: Status;
  verificationToken?: string;
  approvedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  name: { type: String },
  role: { type: String, enum: ['admin', 'coordinator', 'member'], default: 'member' },
  status: { type: String, enum: ['unverified', 'pending', 'active'], default: 'unverified' },
  verificationToken: { type: String },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
