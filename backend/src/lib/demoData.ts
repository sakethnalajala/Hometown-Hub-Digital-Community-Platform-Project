// Demo data for development/testing without MongoDB
import bcryptjs from 'bcryptjs';

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

// In-memory demo database
let demoUsers: Map<string, DemoUser> = new Map();
let demoRefreshTokens: Map<string, { token: string; userId: string; expiresAt: Date }> = new Map();

// Initialize demo users
export async function initializeDemoUsers() {
  const demoPasswordHash = await bcryptjs.hash('Demo@12345', 12);
  const adminPasswordHash = await bcryptjs.hash('Admin@12345', 12);

  const demoUser: DemoUser = {
    id: 'demo-user-001',
    email: 'demo@hometownhub.com',
    passwordHash: demoPasswordHash,
    name: 'Demo User',
    username: 'demouser',
    phone: '+1 (555) 123-4567',
    bio: 'Welcome to Hometown Hub! This is the demo account for testing all features.',
    hometown: 'New York',
    currentCity: 'New York City',
    interests: ['Community', 'Events', 'Social'],
    role: 'USER',
    isVerified: true,
    isActive: true,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    coverImage: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=1200&h=400&fit=crop',
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const adminUser: DemoUser = {
    id: 'admin-user-001',
    email: 'admin@hometownhub.com',
    passwordHash: adminPasswordHash,
    name: 'Admin User',
    username: 'admin',
    phone: '+1 (555) 999-8888',
    bio: 'Administrator of Hometown Hub',
    hometown: 'San Francisco',
    currentCity: 'San Francisco',
    interests: ['Management', 'Community', 'Events'],
    role: 'ADMIN',
    isVerified: true,
    isActive: true,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop',
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  demoUsers.set(demoUser.email, demoUser);
  demoUsers.set(adminUser.email, adminUser);

  console.log('✓ Demo users initialized: demo@hometownhub.com (password: Demo@12345) and admin@hometownhub.com (password: Admin@12345)');
}

export function getDemoUserByEmail(email: string): DemoUser | undefined {
  return demoUsers.get(email);
}

export function getDemoUserById(id: string): DemoUser | undefined {
  for (const user of demoUsers.values()) {
    if (user.id === id) return user;
  }
  return undefined;
}

export function addDemoRefreshToken(token: string, userId: string, expiresAt: Date) {
  demoRefreshTokens.set(token, { token, userId, expiresAt });
}

export function getDemoRefreshToken(token: string) {
  return demoRefreshTokens.get(token);
}

export function revokeDemoRefreshToken(token: string) {
  demoRefreshTokens.delete(token);
}

export function getAllDemoUsers(): DemoUser[] {
  return Array.from(demoUsers.values());
}
