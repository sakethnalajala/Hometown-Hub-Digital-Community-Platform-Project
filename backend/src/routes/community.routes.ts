import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCommunitySchema, updateCommunitySchema } from '../validators/schemas';
import { upload, uploadImage } from '../lib/upload';
import { createNotification } from './notification.routes';

export const communityRouter = Router();

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
}

// GET /api/communities - Discover communities
communityRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const city = req.query.city as string;
    const categoryId = req.query.categoryId as string;

    const where: any = { status: 'APPROVED' };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { city: { contains: search } },
      ];
    }
    if (city) where.city = { contains: city };
    if (categoryId) where.categoryId = categoryId;

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        include: {
          category: { select: { name: true, icon: true, color: true } },
          createdBy: { select: { id: true, name: true, profileImage: true } },
          _count: { select: { members: true, posts: true } },
        },
        orderBy: { memberCount: 'desc' },
        skip,
        take: limit,
      }),
      prisma.community.count({ where }),
    ]);

    res.json({
      success: true,
      data: communities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch communities' });
  }
});

// POST /api/communities - Create community
communityRouter.post('/', authenticate, validate(createCommunitySchema), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, city, state, country, categoryId, isPrivate, rules } = req.body;
    const slug = generateSlug(name);

    const community = await prisma.community.create({
      data: {
        name, slug, description, city, state, country: country || 'India',
        categoryId, isPrivate, rules: JSON.stringify(rules || []),
        createdById: req.user!.userId,
        status: req.user!.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
      },
    });

    // Auto-join creator as admin
    await prisma.communityMember.create({
      data: {
        userId: req.user!.userId,
        communityId: community.id,
        role: 'ADMIN',
        status: 'APPROVED',
      },
    });

    res.status(201).json({
      success: true,
      message: req.user!.role === 'ADMIN'
        ? 'Community created successfully'
        : 'Community request submitted for review',
      data: community,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to create community' });
  }
});

// GET /api/communities/:slug
communityRouter.get('/:slug', async (req: Request, res: Response) => {
  try {
    const community = await prisma.community.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: { select: { name: true, icon: true, color: true } },
        createdBy: { select: { id: true, name: true, username: true, profileImage: true } },
        _count: { select: { members: true, posts: true, events: true } },
      },
    });
    if (!community) {
      res.status(404).json({ success: false, message: 'Community not found' });
      return;
    }
    res.json({ success: true, data: community });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch community' });
  }
});

// PUT /api/communities/:id
communityRouter.put('/:id', authenticate, validate(updateCommunitySchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const membership = await prisma.communityMember.findFirst({
      where: { userId: req.user!.userId, communityId: id, role: { in: ['ADMIN', 'MODERATOR'] } },
    });
    if (!membership && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized to update this community' });
      return;
    }
    const updated = await prisma.community.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, message: 'Community updated', data: updated });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update community' });
  }
});

// POST /api/communities/:id/banner
communityRouter.post('/:id/banner', authenticate, upload.single('banner'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file provided' }); return; }
    const imageUrl = await uploadImage(req.file.path, 'banners');
    await prisma.community.update({ where: { id: req.params.id }, data: { bannerImage: imageUrl } });
    res.json({ success: true, data: { bannerImage: imageUrl } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to upload banner' });
  }
});

// POST /api/communities/:id/join
communityRouter.post('/:id/join', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) { res.status(404).json({ success: false, message: 'Community not found' }); return; }
    if (community.status !== 'APPROVED') {
      res.status(400).json({ success: false, message: 'Community is not available' }); return;
    }

    const existing = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: req.user!.userId, communityId: id } },
    });
    if (existing) {
      res.status(409).json({ success: false, message: 'Already a member or request pending' }); return;
    }

    const status = community.isPrivate ? 'PENDING' : 'APPROVED';
    await prisma.communityMember.create({
      data: { userId: req.user!.userId, communityId: id, status },
    });

    if (status === 'APPROVED') {
      await prisma.community.update({
        where: { id },
        data: { memberCount: { increment: 1 } },
      });
    }

    res.json({
      success: true,
      message: community.isPrivate ? 'Join request sent' : 'Joined community successfully',
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to join community' });
  }
});

// DELETE /api/communities/:id/leave
communityRouter.delete('/:id/leave', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const membership = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: req.user!.userId, communityId: id } },
    });
    if (!membership) { res.status(404).json({ success: false, message: 'Not a member' }); return; }

    await prisma.communityMember.delete({
      where: { userId_communityId: { userId: req.user!.userId, communityId: id } },
    });
    if (membership.status === 'APPROVED') {
      await prisma.community.update({ where: { id }, data: { memberCount: { decrement: 1 } } });
    }
    res.json({ success: true, message: 'Left community successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to leave community' });
  }
});

// GET /api/communities/:id/members
communityRouter.get('/:id/members', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const members = await prisma.communityMember.findMany({
      where: { communityId: req.params.id, status: 'APPROVED' },
      include: {
        user: { select: { id: true, name: true, username: true, profileImage: true, hometown: true } },
      },
      orderBy: { joinedAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    res.json({ success: true, data: members });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch members' });
  }
});

// GET /api/communities/:id/posts
communityRouter.get('/:id/posts', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const posts = await prisma.post.findMany({
      where: { communityId: req.params.id },
      include: {
        author: { select: { id: true, name: true, username: true, profileImage: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });
    const parsedPosts = posts.map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
    }));
    res.json({ success: true, data: parsedPosts });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

// PUT /api/communities/:id/members/:userId/role
communityRouter.put('/:id/members/:userId/role', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    const isAdmin = await prisma.communityMember.findFirst({
      where: { userId: req.user!.userId, communityId: id, role: 'ADMIN' },
    });
    if (!isAdmin && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized' }); return;
    }
    await prisma.communityMember.update({
      where: { userId_communityId: { userId, communityId: id } },
      data: { role },
    });
    res.json({ success: true, message: 'Member role updated' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
});

// DELETE /api/communities/:id/members/:userId
communityRouter.delete('/:id/members/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id, userId } = req.params;
    const isMod = await prisma.communityMember.findFirst({
      where: { userId: req.user!.userId, communityId: id, role: { in: ['ADMIN', 'MODERATOR'] } },
    });
    if (!isMod && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized' }); return;
    }
    await prisma.communityMember.delete({
      where: { userId_communityId: { userId, communityId: id } },
    });
    await prisma.community.update({ where: { id }, data: { memberCount: { decrement: 1 } } });
    res.json({ success: true, message: 'Member removed' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to remove member' });
  }
});
