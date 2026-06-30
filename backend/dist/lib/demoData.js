"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDemoUsers = initializeDemoUsers;
exports.getDemoUserByEmail = getDemoUserByEmail;
exports.getDemoUserById = getDemoUserById;
exports.addDemoRefreshToken = addDemoRefreshToken;
exports.getDemoRefreshToken = getDemoRefreshToken;
exports.revokeDemoRefreshToken = revokeDemoRefreshToken;
exports.getAllDemoUsers = getAllDemoUsers;
// Demo data for development/testing without MongoDB
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// In-memory demo database
let demoUsers = new Map();
let demoRefreshTokens = new Map();
// Initialize demo users
async function initializeDemoUsers() {
    const demoPasswordHash = await bcryptjs_1.default.hash('Demo@12345', 12);
    const adminPasswordHash = await bcryptjs_1.default.hash('Admin@12345', 12);
    const demoUser = {
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
    const adminUser = {
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
function getDemoUserByEmail(email) {
    return demoUsers.get(email);
}
function getDemoUserById(id) {
    for (const user of demoUsers.values()) {
        if (user.id === id)
            return user;
    }
    return undefined;
}
function addDemoRefreshToken(token, userId, expiresAt) {
    demoRefreshTokens.set(token, { token, userId, expiresAt });
}
function getDemoRefreshToken(token) {
    return demoRefreshTokens.get(token);
}
function revokeDemoRefreshToken(token) {
    demoRefreshTokens.delete(token);
}
function getAllDemoUsers() {
    return Array.from(demoUsers.values());
}
//# sourceMappingURL=demoData.js.map