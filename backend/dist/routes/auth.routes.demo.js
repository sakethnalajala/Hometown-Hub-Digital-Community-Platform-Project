"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jwt_1 = require("../lib/jwt");
const email_1 = require("../lib/email");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const schemas_1 = require("../validators/schemas");
const db_1 = require("../lib/db");
const demoData_1 = require("../lib/demoData");
exports.authRouter = (0, express_1.Router)();
// Helper function to get user data — Prisma → in-memory demo → Mongoose
async function getUserByEmail(email) {
    const normalized = email.toLowerCase();
    const demoUser = (0, demoData_1.getDemoUserByEmail)(normalized);
    if (process.env.DATABASE_URL) {
        try {
            const { prisma } = await Promise.resolve().then(() => __importStar(require('../lib/prisma')));
            const user = await prisma.user.findUnique({ where: { email: normalized } });
            if (user)
                return user;
        }
        catch { /* fall through */ }
    }
    if ((0, db_1.isDemoMode)() && demoUser)
        return demoUser;
    if (demoUser)
        return demoUser;
    try {
        const { User } = await Promise.resolve().then(() => __importStar(require('../models/User')));
        return await User.findOne({ email: normalized });
    }
    catch {
        return null;
    }
}
async function getUserById(id) {
    const demoUser = (0, demoData_1.getDemoUserById)(id);
    if (demoUser)
        return demoUser;
    if (process.env.DATABASE_URL) {
        try {
            const { prisma } = await Promise.resolve().then(() => __importStar(require('../lib/prisma')));
            const user = await prisma.user.findUnique({ where: { id } });
            if (user)
                return user;
        }
        catch { /* fall through */ }
    }
    try {
        const { User } = await Promise.resolve().then(() => __importStar(require('../models/User')));
        return await User.findById(id);
    }
    catch {
        return null;
    }
}
// POST /api/auth/register
exports.authRouter.post('/register', (0, validate_middleware_1.validate)(schemas_1.registerSchema), async (req, res) => {
    try {
        const { name, username, email, password, hometown, currentCity } = req.body;
        // Demo mode: signing up with the demo account logs in (sign up + sign in flow)
        if ((0, db_1.isDemoMode)() && email.toLowerCase() === 'demo@hometownhub.com') {
            const demoUser = (0, demoData_1.getDemoUserByEmail)('demo@hometownhub.com');
            if (!demoUser) {
                res.status(500).json({ success: false, message: 'Demo account unavailable' });
                return;
            }
            const isValid = await bcryptjs_1.default.compare(password, demoUser.passwordHash);
            if (!isValid) {
                res.status(401).json({ success: false, message: 'Invalid email or password. Demo password is Demo@12345' });
                return;
            }
            const accessToken = (0, jwt_1.signAccessToken)({ userId: demoUser.id, email: demoUser.email, role: demoUser.role });
            const refreshToken = (0, jwt_1.signRefreshToken)({ userId: demoUser.id, email: demoUser.email, role: demoUser.role });
            (0, demoData_1.addDemoRefreshToken)(refreshToken, demoUser.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
            res.status(201).json({
                success: true,
                message: 'Demo account ready — signed in successfully',
                data: {
                    user: {
                        id: demoUser.id,
                        name: demoUser.name,
                        username: demoUser.username,
                        email: demoUser.email,
                        role: demoUser.role,
                        profileImage: demoUser.profileImage,
                        hometown: demoUser.hometown,
                        currentCity: demoUser.currentCity,
                        bio: demoUser.bio,
                    },
                    accessToken,
                    refreshToken,
                },
            });
            return;
        }
        // Demo mode: any other email/password creates a real (in-memory) account
        // that can immediately log back in with the same credentials.
        if ((0, db_1.isDemoMode)()) {
            const normalizedEmail = email.toLowerCase();
            if ((0, demoData_1.getDemoUserByEmail)(normalizedEmail)) {
                res.status(409).json({ success: false, message: 'Email already in use' });
                return;
            }
            const passwordHash = await bcryptjs_1.default.hash(password, 12);
            const newUser = {
                id: `user-${crypto_1.default.randomBytes(8).toString('hex')}`,
                email: normalizedEmail,
                passwordHash,
                name,
                username: username || normalizedEmail.split('@')[0],
                profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
                bio: '',
                hometown: hometown || '',
                currentCity: currentCity || '',
                interests: [],
                role: 'USER',
                isVerified: true,
                isActive: true,
                lastSeen: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            (0, demoData_1.addDemoUser)(newUser);
            const accessToken = (0, jwt_1.signAccessToken)({ userId: newUser.id, email: newUser.email, role: newUser.role });
            const refreshToken = (0, jwt_1.signRefreshToken)({ userId: newUser.id, email: newUser.email, role: newUser.role });
            (0, demoData_1.addDemoRefreshToken)(refreshToken, newUser.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: {
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        username: newUser.username,
                        email: newUser.email,
                        role: newUser.role,
                        profileImage: newUser.profileImage,
                        hometown: newUser.hometown,
                        currentCity: newUser.currentCity,
                        bio: newUser.bio,
                    },
                    accessToken,
                    refreshToken,
                },
            });
            return;
        }
        const existing = await getUserByEmail(email);
        if (existing) {
            res.status(409).json({ success: false, message: 'Email already in use' });
            return;
        }
        // Try Mongoose registration
        try {
            const { User } = await Promise.resolve().then(() => __importStar(require('../models/User')));
            const passwordHash = await bcryptjs_1.default.hash(password, 12);
            const user = new User({
                name,
                username,
                email,
                passwordHash,
                hometown,
                currentCity,
            });
            await user.save();
            const accessToken = (0, jwt_1.signAccessToken)({ userId: user._id.toString(), email: user.email, role: user.role });
            const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user._id.toString(), email: user.email, role: user.role });
            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        profileImage: user.profileImage,
                        hometown: user.hometown,
                        currentCity: user.currentCity,
                    },
                    accessToken,
                    refreshToken,
                },
            });
        }
        catch (err) {
            res.status(500).json({ success: false, message: 'Registration failed' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});
// POST /api/auth/login
exports.authRouter.post('/login', (0, validate_middleware_1.validate)(schemas_1.loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmail(email);
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const userId = 'id' in user ? user.id : user._id?.toString();
        const accessToken = (0, jwt_1.signAccessToken)({ userId, email: user.email, role: user.role });
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId, email: user.email, role: user.role });
        if ((0, db_1.isDemoMode)()) {
            (0, demoData_1.addDemoRefreshToken)(refreshToken, userId, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        }
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: userId,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profileImage,
                    hometown: user.hometown,
                    currentCity: user.currentCity,
                    bio: user.bio,
                },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});
// POST /api/auth/refresh
exports.authRouter.post('/refresh', (0, validate_middleware_1.validate)(schemas_1.refreshTokenSchema), async (req, res) => {
    try {
        const { refreshToken } = req.body;
        try {
            const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
            const user = await getUserById(payload.userId);
            if (!user) {
                res.status(401).json({ success: false, message: 'User not found' });
                return;
            }
            const newAccessToken = (0, jwt_1.signAccessToken)({
                userId: payload.userId,
                email: user.email,
                role: user.role,
            });
            const newRefreshToken = (0, jwt_1.signRefreshToken)({
                userId: payload.userId,
                email: user.email,
                role: user.role,
            });
            if ((0, db_1.isDemoMode)()) {
                (0, demoData_1.revokeDemoRefreshToken)(refreshToken);
                (0, demoData_1.addDemoRefreshToken)(newRefreshToken, payload.userId, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
            }
            res.json({
                success: true,
                data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
            });
        }
        catch (err) {
            res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Token refresh failed' });
    }
});
// POST /api/auth/logout
exports.authRouter.post('/logout', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken && (0, db_1.isDemoMode)()) {
            (0, demoData_1.revokeDemoRefreshToken)(refreshToken);
        }
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Logout failed' });
    }
});
// POST /api/auth/forgot-password
exports.authRouter.post('/forgot-password', (0, validate_middleware_1.validate)(schemas_1.forgotPasswordSchema), async (req, res) => {
    try {
        const { email } = req.body;
        const user = await getUserByEmail(email);
        const successMsg = 'If that email exists, a reset link has been sent';
        if (!user) {
            res.json({ success: true, message: successMsg });
            return;
        }
        if (process.env.DATABASE_URL) {
            try {
                const { prisma } = await Promise.resolve().then(() => __importStar(require('../lib/prisma')));
                const token = crypto_1.default.randomBytes(32).toString('hex');
                await prisma.passwordReset.create({
                    data: { token, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
                });
                const resetUrl = `${process.env.FRONTEND_URL || 'https://hometown-hub-virid.vercel.app'}/reset-password?token=${token}`;
                if ((0, db_1.isDemoMode)()) {
                    res.json({ success: true, message: successMsg, data: { resetUrl } });
                    return;
                }
                await (0, email_1.sendEmail)({
                    to: email,
                    subject: 'Reset your Hometown Hub password',
                    html: (0, email_1.getPasswordResetEmail)(user.name, resetUrl),
                });
            }
            catch { /* fall through */ }
        }
        res.json({
            success: true,
            message: (0, db_1.isDemoMode)()
                ? 'If that email exists, a reset link would be sent. In demo mode, use demo@hometownhub.com / Demo@12345'
                : successMsg,
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to process request' });
    }
});
// POST /api/auth/reset-password
exports.authRouter.post('/reset-password', (0, validate_middleware_1.validate)(schemas_1.resetPasswordSchema), async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!process.env.DATABASE_URL) {
            res.status(400).json({ success: false, message: 'Password reset requires database configuration' });
            return;
        }
        const { prisma } = await Promise.resolve().then(() => __importStar(require('../lib/prisma')));
        const reset = await prisma.passwordReset.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!reset || reset.isUsed || reset.expiresAt < new Date()) {
            res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        await prisma.$transaction([
            prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
            prisma.passwordReset.update({ where: { id: reset.id }, data: { isUsed: true } }),
            prisma.refreshToken.updateMany({ where: { userId: reset.userId }, data: { isRevoked: true } }),
        ]);
        res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
});
// POST /api/auth/firebase — Google / Firebase sign-in (demo mode simulates demo account)
exports.authRouter.post('/firebase', async (req, res) => {
    try {
        if ((0, db_1.isDemoMode)()) {
            const demoUser = (0, demoData_1.getDemoUserByEmail)('demo@hometownhub.com');
            if (!demoUser) {
                res.status(500).json({ success: false, message: 'Demo account unavailable' });
                return;
            }
            const accessToken = (0, jwt_1.signAccessToken)({ userId: demoUser.id, email: demoUser.email, role: demoUser.role });
            const refreshToken = (0, jwt_1.signRefreshToken)({ userId: demoUser.id, email: demoUser.email, role: demoUser.role });
            (0, demoData_1.addDemoRefreshToken)(refreshToken, demoUser.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
            res.json({
                success: true,
                message: 'Google Sign-In successful (demo mode)',
                data: {
                    user: {
                        id: demoUser.id,
                        name: demoUser.name,
                        username: demoUser.username,
                        email: demoUser.email,
                        role: demoUser.role,
                        profileImage: demoUser.profileImage,
                        hometown: demoUser.hometown,
                        currentCity: demoUser.currentCity,
                        bio: demoUser.bio,
                    },
                    accessToken,
                    refreshToken,
                },
            });
            return;
        }
        res.status(501).json({
            success: false,
            message: 'Firebase authentication requires production configuration. Set FIREBASE_SERVICE_ACCOUNT_KEY and DATABASE_URL.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Firebase authentication failed' });
    }
});
// POST /api/auth/change-password
exports.authRouter.post('/change-password', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ success: false, message: 'Current and new password are required' });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
            return;
        }
        const { prisma } = await Promise.resolve().then(() => __importStar(require('../lib/prisma')));
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!valid) {
            res.status(400).json({ success: false, message: 'Current password is incorrect' });
            return;
        }
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: await bcryptjs_1.default.hash(newPassword, 12) },
        });
        res.json({ success: true, message: 'Password updated successfully' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
});
// GET /api/auth/me
exports.authRouter.get('/me', auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const user = await getUserById(req.user.userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({
            success: true,
            data: {
                user: {
                    id: req.user.userId,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profileImage,
                    hometown: user.hometown,
                    currentCity: user.currentCity,
                    bio: user.bio,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
});
// Health check endpoint
exports.authRouter.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Auth service is healthy',
        mode: (0, db_1.isDemoMode)() ? 'demo' : 'production',
        demoAccount: (0, db_1.isDemoMode)() ? { email: 'demo@hometownhub.com', password: 'Demo@12345' } : null,
    });
});
//# sourceMappingURL=auth.routes.demo.js.map