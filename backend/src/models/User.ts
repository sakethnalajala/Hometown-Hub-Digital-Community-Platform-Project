import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  username: string;
  firebaseUid?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  hometown?: string;
  currentCity?: string;
  interests?: string[];
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  isVerified: boolean;
  isActive: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  firebaseUid: { type: String, sparse: true, unique: true },
  profileImage: { type: String },
  coverImage: { type: String },
  bio: { type: String },
  hometown: { type: String },
  currentCity: { type: String },
  interests: [{ type: String }],
  role: { type: String, enum: ['USER', 'MODERATOR', 'ADMIN'], default: 'USER' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date },
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
