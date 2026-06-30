import { Router, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { signAccessToken, signRefreshToken, verifyRefreshToken, verifyAccessToken } from '../lib/jwt';
import { sendEmail, getPasswordResetEmail } from '../lib/email';
import { validate } from '../middleware/validate.middleware';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from '../validators/schemas';
import { isDemoMode } from '../lib/db';
import {
  getDemoUserByEmail,
  getDemoUserById,
  addDemoRefreshToken,
  getDemoRefreshToken,
  revokeDemoRefreshToken,
} from '../lib/demoData';

export const authRouter = Router();

// Helper function to get user data — Prisma → in-memory demo → Mongoose
async function getUserByEmail(email: string) {
  const normalized = email.toLowerCase();
  const demoUser = getDemoUserByEmail(normalized);

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import('../lib/prisma');
      const user = await prisma.user.findUnique({ where: { email: normalized } });
      if (user) return user;
    } catch { /* fall through */ }
  }

  if (isDemoMode() && demoUser) return demoUser;
  if (demoUser) return demoUser;

  try {
    const { User } = await import('../models/User');
    return await User.findOne({ email: normalized });
  } catch {
    return null;
  }
}

async function getUserById(id: string) {
  const demoUser = getDemoUserById(id);
  if (demoUser) return demoUser;

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import('../lib/prisma');
      const user = await prisma.user.findUnique({ where: { id } });
      if (user) return user;
    } catch { /* fall through */ }
  }

  try {
    const { User } = await import('../models/User');
    return await User.findById(id);
  } catch {
    return null;
  }
}

// POST /api/auth/register
authRouter.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, hometown, currentCity } = req.body;

    // Demo mode: signing up with the demo account logs in (sign up + sign in flow)
    if (isDemoMode() && email.toLowerCase() === 'demo@hometownhub.com') {
      const demoUser = getDemoUserByEmail('demo@hometownhub.com');
      if (!demoUser) {
        res.status(500).json({ success: false, message: 'Demo account unavailable' });
        return;
      }
      const isValid = await bcryptjs.compare(password, demoUser.passwordHash);
      if (!isValid) {
        res.status(401).json({ success: false, message: 'Invalid email or password. Demo password is Demo@12345' });
        return;
      }
      const accessToken = signAccessToken({ userId: demoUser.id, email: demoUser.email, role: demoUser.role });
      const refreshToken = signRefreshToken({ userId: demoUser.id, email: demoUser.email, role: demoUser.role });
      addDemoRefreshToken(refreshToken, demoUser.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
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

    if (isDemoMode()) {
      res.status(403).json({
        success: false,
        message: 'Registration disabled in demo mode. Sign up with demo@hometownhub.com / Demo@12345 or use Sign In.',
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
      const { User } = await import('../models/User');
      const passwordHash = await bcryptjs.hash(password, 12);
      const user = new User({
        name,
        username,
        email,
        passwordHash,
        hometown,
        currentCity,
      });
      await user.save();

      const accessToken = signAccessToken({ userId: user._id.toString(), email: user.email, role: user.role });
      const refreshToken = signRefreshToken({ userId: user._id.toString(), email: user.email, role: user.role });

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
    } catch (err) {
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// POST /api/auth/login
authRouter.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const userId = 'id' in user ? user.id : (user as any)._id?.toString();

    const accessToken = signAccessToken({ userId, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId, email: user.email, role: user.role });

    if (isDemoMode()) {
      addDemoRefreshToken(refreshToken, userId, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// POST /api/auth/refresh
authRouter.post('/refresh', validate(refreshTokenSchema), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    try {
      const payload = verifyRefreshToken(refreshToken);

      const user = await getUserById(payload.userId);
      if (!user) {
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }

      const newAccessToken = signAccessToken({
        userId: payload.userId,
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = signRefreshToken({
        userId: payload.userId,
        email: user.email,
        role: user.role,
      });

      if (isDemoMode()) {
        revokeDemoRefreshToken(refreshToken);
        addDemoRefreshToken(newRefreshToken, payload.userId, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      }

      res.json({
        success: true,
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      });
    } catch (err) {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Token refresh failed' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken && isDemoMode()) {
      revokeDemoRefreshToken(refreshToken);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', validate(forgotPasswordSchema), async (req: Request, res: Response) => {
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
        const { prisma } = await import('../lib/prisma');
        const token = crypto.randomBytes(32).toString('hex');
        await prisma.passwordReset.create({
          data: { token, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
        });
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        if (isDemoMode()) {
          res.json({ success: true, message: successMsg, data: { resetUrl } });
          return;
        }
        await sendEmail({
          to: email,
          subject: 'Reset your Hometown Hub password',
          html: getPasswordResetEmail(user.name, resetUrl),
        });
      } catch { /* fall through */ }
    }

    res.json({
      success: true,
      message: isDemoMode()
        ? 'If that email exists, a reset link would be sent. In demo mode, use demo@hometownhub.com / Demo@12345'
        : successMsg,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!process.env.DATABASE_URL) {
      res.status(400).json({ success: false, message: 'Password reset requires database configuration' });
      return;
    }

    const { prisma } = await import('../lib/prisma');
    const reset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!reset || reset.isUsed || reset.expiresAt < new Date()) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      return;
    }

    const passwordHash = await bcryptjs.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { isUsed: true } }),
      prisma.refreshToken.updateMany({ where: { userId: reset.userId }, data: { isRevoked: true } }),
    ]);

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// POST /api/auth/firebase — Google / Firebase sign-in (demo mode simulates demo account)
authRouter.post('/firebase', async (req: Request, res: Response) => {
  try {
    if (isDemoMode()) {
      const demoUser = getDemoUserByEmail('demo@hometownhub.com');
      if (!demoUser) {
        res.status(500).json({ success: false, message: 'Demo account unavailable' });
        return;
      }
      const accessToken = signAccessToken({ userId: demoUser.id, email: demoUser.email, role: demoUser.role });
      const refreshToken = signRefreshToken({ userId: demoUser.id, email: demoUser.email, role: demoUser.role });
      addDemoRefreshToken(refreshToken, demoUser.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Firebase authentication failed' });
  }
});

// POST /api/auth/change-password
authRouter.post('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
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

    const { prisma } = await import('../lib/prisma');
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const valid = await bcryptjs.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcryptjs.hash(newPassword, 12) },
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// Health check endpoint
authRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Auth service is healthy',
    mode: isDemoMode() ? 'demo' : 'production',
    demoAccount: isDemoMode() ? { email: 'demo@hometownhub.com', password: 'Demo@12345' } : null,
  });
});
