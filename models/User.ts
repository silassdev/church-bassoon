import mongoose, { Schema, Document } from 'mongoose';

export type Role = 'admin' | 'coordinator' | 'member';
export type Status = 'unverified' | 'pending' | 'active' | 'approved' | 'declined' | 'rejected' | 'suspended';

export interface IUser extends Document {
  email: string;
  name?: string;
  passwordHash?: string | null;
  role: Role;
  status: Status;
  provider: 'credentials' | 'google';
  verificationToken?: string | null;
  approvedBy?: mongoose.Types.ObjectId | null;
  houseAddress?: string | null;
  dob?: Date | null;
  state?: string | null;
  city?: string | null;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  passwordHash: { type: String, default: null },
  role: { type: String, enum: ['admin', 'coordinator', 'member'], default: 'member' },
  status: { type: String, enum: ['unverified', 'pending', 'active', 'approved', 'declined', 'rejected', 'suspended'], default: 'unverified' },
  provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
  verificationToken: { type: String, default: null },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

  // profile fields
  houseAddress: { type: String, default: null },
  dob: { type: Date, default: null },
  state: { type: String, default: null },
  city: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
});

// Clear the model in development to ensure schema changes are picked up
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
