import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, AuthProvider } from '@/lib/constants';

export interface IUser extends Document {
  email: string;
  name?: string;
  passwordHash?: string | null;
  role: (typeof UserRole)[keyof typeof UserRole];
  status: 'unverified' | 'pending' | 'active';
  provider: (typeof AuthProvider)[keyof typeof AuthProvider];
  verificationToken?: string | null;
  approvedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  passwordHash: { type: String, default: null },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.MEMBER },
  status: { type: String, enum: ['unverified', 'pending', 'active'], default: 'unverified' },
  provider: { type: String, enum: Object.values(AuthProvider), default: AuthProvider.CREDENTIALS },
  verificationToken: { type: String, default: null },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
