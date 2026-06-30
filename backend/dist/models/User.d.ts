import mongoose, { Document } from 'mongoose';
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
export declare const User: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=User.d.ts.map