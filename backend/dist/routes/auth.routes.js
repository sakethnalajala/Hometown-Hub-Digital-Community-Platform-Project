"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const jwt_1 = require("../lib/jwt");
const email_1 = require("../lib/email");
const validate_middleware_1 = require("../middleware/validate.middleware");
const firebase_1 = require("../lib/firebase");
const auth_middleware_1 = require("../middleware/auth.middleware");
const schemas_1 = require("../validators/schemas");
exports.authRouter = (0, express_1.Router)();
// POST /api/auth/firebase
exports.authRouter.post('/firebase', async (req, res) => {
    try {
        const { idToken, name: reqName, username: reqUsername, hometown } = req.body;
        if (!idToken) {
            res.status(400).json({ success: false, message: 'Firebase token required' });
            return;
        }
        const decodedToken = await (0, firebase_1.verifyFirebaseToken)(idToken);
        const { email, name: tokenName, uid, picture } = decodedToken;
        if (!email) {
            res.status(400).json({ success: false, message: 'Email not provided by Firebase' });
            return;
        }
        let user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    name: reqName || tokenName || 'User',
                    username: reqUsername || email.split('@')[0] + Math.floor(Math.random() * 1000),
                    hometown,
                    profileImage: picture,
                    passwordHash: '', // Firebase users don't have a password
                }
            });
        }
        else if (!user.profileImage && picture) {
            user = await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { profileImage: picture },
            });
        }
        // Issue JWT using our system
        const accessToken = (0, jwt_1.signAccessToken)({ userId: user.id, email: user.email, role: user.role });
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user.id, email: user.email, role: user.role });
        res.json({
            success: true,
            message: 'Firebase login successful',
            data: {
                user: {
                    id: user.id, name: user.name, username: user.username, email: user.email,
                    role: user.role, profileImage: user.profileImage,
                },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        console.error('Firebase Auth Error:', error);
        res.status(500).json({ success: false, message: 'Firebase authentication failed' });
    }
});
// POST /api/auth/register
exports.authRouter.post('/register', (0, validate_middleware_1.validate)(schemas_1.registerSchema), async (req, res) => {
    try {
        const { name, username, email, password, hometown, currentCity } = req.body;
        const existing = await prisma_1.prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        if (existing) {
            const field = existing.email === email ? 'Email' : 'Username';
            res.status(409).json({ success: false, message: `${field} already in use` });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.prisma.user.create({
            data: { name, username, email, passwordHash, hometown, currentCity },
            select: {
                id: true, name: true, username: true, email: true,
                role: true, profileImage: true, hometown: true, currentCity: true, createdAt: true,
            },
        });
        const accessToken = (0, jwt_1.signAccessToken)({ userId: user.id, email: user.email, role: user.role });
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user.id, email: user.email, role: user.role });
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: { user, accessToken, refreshToken },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});
// POST /api/auth/login
exports.authRouter.post('/login', (0, validate_middleware_1.validate)(schemas_1.loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        // Update last seen
        await prisma_1.prisma.user.update({ where: { id: user.id }, data: { lastSeen: new Date() } });
        const accessToken = (0, jwt_1.signAccessToken)({ userId: user.id, email: user.email, role: user.role });
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user.id, email: user.email, role: user.role });
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id, name: user.name, username: user.username, email: user.email,
                    role: user.role, profileImage: user.profileImage, hometown: user.hometown,
                    currentCity: user.currentCity, bio: user.bio,
                },
                accessToken,
                refreshToken,
            },
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});
// POST /api/auth/refresh
exports.authRouter.post('/refresh', (0, validate_middleware_1.validate)(schemas_1.refreshTokenSchema), async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const stored = await prisma_1.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
            res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
            return;
        }
        try {
            (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            res.status(401).json({ success: false, message: 'Invalid refresh token' });
            return;
        }
        // Rotate refresh token
        await (0, jwt_1.revokeRefreshToken)(refreshToken);
        const newAccessToken = (0, jwt_1.signAccessToken)({
            userId: stored.user.id, email: stored.user.email, role: stored.user.role,
        });
        const newRefreshToken = (0, jwt_1.signRefreshToken)({
            userId: stored.user.id, email: stored.user.email, role: stored.user.role,
        });
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: stored.user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        res.json({
            success: true,
            data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Token refresh failed' });
    }
});
// POST /api/auth/logout
exports.authRouter.post('/logout', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await (0, jwt_1.revokeRefreshToken)(refreshToken);
        }
        else {
            await (0, jwt_1.revokeAllUserTokens)(req.user.userId);
        }
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Logout failed' });
    }
});
// POST /api/auth/forgot-password
exports.authRouter.post('/forgot-password', (0, validate_middleware_1.validate)(schemas_1.forgotPasswordSchema), async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        // Always return success to prevent email enumeration
        const successMsg = 'If that email exists, a reset link has been sent';
        if (!user) {
            res.json({ success: true, message: successMsg });
            return;
        }
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await prisma_1.prisma.passwordReset.create({
            data: { token, userId: user.id, expiresAt },
        });
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await (0, email_1.sendEmail)({
            to: email,
            subject: 'Reset your Hometown Hub password',
            html: (0, email_1.getPasswordResetEmail)(user.name, resetUrl),
        });
        res.json({ success: true, message: successMsg });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to process request' });
    }
});
// POST /api/auth/reset-password
exports.authRouter.post('/reset-password', (0, validate_middleware_1.validate)(schemas_1.resetPasswordSchema), async (req, res) => {
    try {
        const { token, password } = req.body;
        const reset = await prisma_1.prisma.passwordReset.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!reset || reset.isUsed || reset.expiresAt < new Date()) {
            res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
            prisma_1.prisma.passwordReset.update({ where: { id: reset.id }, data: { isUsed: true } }),
            prisma_1.prisma.refreshToken.updateMany({ where: { userId: reset.userId }, data: { isRevoked: true } }),
        ]);
        res.json({ success: true, message: 'Password reset successfully' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Password reset failed' });
    }
});
// GET /api/auth/me
exports.authRouter.get('/me', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true, name: true, username: true, email: true, phone: true,
                profileImage: true, coverImage: true, bio: true, hometown: true,
                currentCity: true, interests: true, role: true, isVerified: true,
                lastSeen: true, createdAt: true,
                _count: { select: { communityMemberships: true, posts: true, organizedEvents: true } },
            },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
});
//# sourceMappingURL=auth.routes.js.map