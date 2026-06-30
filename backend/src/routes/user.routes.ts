import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema } from '../validators/schemas';
import { upload, uploadImage, deleteImage } from '../lib/upload';

export const userRouter = Router();

// GET /api/users/me
userRouter.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
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
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// PUT /api/users/me
userRouter.put('/me', authenticate, validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, hometown, currentCity, phone, interests } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, bio, hometown, currentCity, phone, interests },
      select: {
        id: true, name: true, username: true, email: true, phone: true,
        profileImage: true, bio: true, hometown: true, currentCity: true, interests: true,
      },
    });
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// POST /api/users/me/avatar
userRouter.post('/me/avatar', authenticate, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file provided' });
      return;
    }

    const current = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { profileImage: true },
    });

    const imageUrl = await uploadImage(req.file.path, 'avatars');

    if (current?.profileImage && current.profileImage.startsWith('/uploads')) {
      await deleteImage(current.profileImage).catch(() => {});
    }

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { profileImage: imageUrl },
    });

    res.json({ success: true, message: 'Avatar updated', data: { profileImage: imageUrl } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to upload avatar' });
  }
});

// POST /api/users/me/cover
userRouter.post('/me/cover', authenticate, upload.single('cover'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file provided' });
      return;
    }
    const imageUrl = await uploadImage(req.file.path, 'covers');
    await prisma.user.update({ where: { id: req.user!.userId }, data: { coverImage: imageUrl } });
    res.json({ success: true, data: { coverImage: imageUrl } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to upload cover' });
  }
});

// GET /api/users/:id
userRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, username: true, profileImage: true, coverImage: true,
        bio: true, hometown: true, currentCity: true, interests: true,
        isVerified: true, lastSeen: true, createdAt: true,
        _count: { select: { communityMemberships: true, posts: true } },
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

// GET /api/users/:id/posts
userRouter.get('/:id/posts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { authorId: req.params.id },
      include: {
        author: { select: { id: true, name: true, username: true, profileImage: true } },
        community: { select: { id: true, name: true, slug: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.post.count({ where: { authorId: req.params.id } });

    res.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

// GET /api/users/:id/communities
userRouter.get('/:id/communities', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const memberships = await prisma.communityMember.findMany({
      where: { userId: req.params.id, status: 'APPROVED' },
      include: {
        community: {
          select: {
            id: true, name: true, slug: true, description: true,
            city: true, bannerImage: true, logoImage: true, memberCount: true,
            category: { select: { name: true, icon: true } },
          },
        },
      },
    });
    res.json({ success: true, data: memberships.map(m => m.community) });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch communities' });
  }
});

// GET /api/users/search
userRouter.get('/search/users', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
      return;
    }
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { username: { contains: q } },
          { hometown: { contains: q } },
        ],
      },
      select: {
        id: true, name: true, username: true, profileImage: true, hometown: true, currentCity: true,
      },
      take: 20,
    });
    res.json({ success: true, data: users });
  } catch {
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});
