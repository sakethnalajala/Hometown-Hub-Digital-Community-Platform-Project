export interface DemoUser {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    username: string;
    phone?: string;
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
export declare function initializeDemoUsers(): Promise<void>;
export declare function getDemoUserByEmail(email: string): DemoUser | undefined;
export declare function getDemoUserById(id: string): DemoUser | undefined;
export declare function addDemoRefreshToken(token: string, userId: string, expiresAt: Date): void;
export declare function getDemoRefreshToken(token: string): {
    token: string;
    userId: string;
    expiresAt: Date;
} | undefined;
export declare function revokeDemoRefreshToken(token: string): void;
export declare function getAllDemoUsers(): DemoUser[];
//# sourceMappingURL=demoData.d.ts.map