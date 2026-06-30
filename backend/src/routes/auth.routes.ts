import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../lib/jwt';
import { sendEmail, getPasswordResetEmail } from '../lib/email';
import { validate } from '../middleware/validate.middleware';
import { verifyFirebaseToken } from '../lib/firebase';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from '../validators/schemas';

export const authRouter = Router();

// POST /api/auth/firebase
authRouter.post('/firebase', async (req: Request, res: Response) => {
  try {
    const { idToken, name: reqName, username: reqUsername, hometown } = req.body;
    if (!idToken) {
      res.status(400).json({ success: false, message: 'Firebase token required' });
      return;
    }

    const decodedToken = await verifyFirebaseToken(idToken);
    const { email, name: tokenName, uid, picture } = decodedToken;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email not provided by Firebase' });
      return;
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: reqName || tokenName || 'User',
          username: reqUsername || email.split('@')[0] + Math.floor(Math.random() * 1000),
          hometown,
          profileImage: picture,
          passwordHash: '', // Firebase users don't have a password
        }
      });
    } else if (!user.profileImage && picture) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { profileImage: picture },
      });
    }

    // Issue JWT using our system
    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

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
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    res.status(500).json({ success: false, message: 'Firebase authentication failed' });
  }
});

// POST /api/auth/register
authRouter.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, hometown, currentCity } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      res.status(409).json({ success: false, message: `${field} already in use` });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, username, email, passwordHash, hometown, currentCity },
      select: {
        id: true, name: true, username: true, email: true,
        role: true, profileImage: true, hometown: true, currentCity: true, createdAt: true,
      },
    });

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });
    await prisma.refreshToken.create({
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// POST /api/auth/login
authRouter.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Update last seen
    await prisma.user.update({ where: { id: user.id }, data: { lastSeen: new Date() } });

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });
    await prisma.refreshToken.create({
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
  } catch {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// POST /api/auth/refresh
authRouter.post('/refresh', validate(refreshTokenSchema), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
      return;
    }

    try {
      verifyRefreshToken(refreshToken);
    } catch {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    // Rotate refresh token
    await revokeRefreshToken(refreshToken);

    const newAccessToken = signAccessToken({
      userId: stored.user.id, email: stored.user.email, role: stored.user.role,
    });
    const newRefreshToken = signRefreshToken({
      userId: stored.user.id, email: stored.user.email, role: stored.user.role,
    });

    await prisma.refreshToken.create({
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
  } catch {
    res.status(500).json({ success: false, message: 'Token refresh failed' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    } else {
      await revokeAllUserTokens(req.user!.userId);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', validate(forgotPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    const successMsg = 'If that email exists, a reset link has been sent';

    if (!user) {
      res.json({ success: true, message: successMsg });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: 'Reset your Hometown Hub password',
      html: getPasswordResetEmail(user.name, resetUrl),
    });

    res.json({ success: true, message: successMsg });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const reset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!reset || reset.isUsed || reset.expiresAt < new Date()) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { isUsed: true } }),
      prisma.refreshToken.updateMany({ where: { userId: reset.userId }, data: { isRevoked: true } }),
    ]);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Password reset failed' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
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
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});
