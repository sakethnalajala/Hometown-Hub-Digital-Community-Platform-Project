import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';

export const adminRouter = Router();

// All admin routes require authentication + ADMIN role
adminRouter.use(authenticate, authorize('ADMIN'));

// GET /api/admin/analytics
adminRouter.get('/analytics', async (_req, res: Response) => {
  try {
    const [
      totalUsers, totalCommunities, totalPosts, totalEvents,
      newUsersToday, pendingCommunities, pendingReports,
      usersByMonth, postsByType,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.community.count({ where: { status: 'APPROVED' } }),
      prisma.post.count(),
      prisma.event.count(),
      prisma.user.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      prisma.community.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: true,
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.post.groupBy({ by: ['type'], _count: true }),
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalCommunities, totalPosts, totalEvents, newUsersToday, pendingCommunities, pendingReports },
        usersByMonth,
        postsByType,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// GET /api/admin/users
adminRouter.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = req.query.search as string;
    const role = req.query.role as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, username: true, email: true, role: true,
          isActive: true, isVerified: true, hometown: true, createdAt: true,
          _count: { select: { posts: true, communityMemberships: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// PUT /api/admin/users/:id
adminRouter.put('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { role, isActive, isVerified } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role, isActive, isVerified },
      select: { id: true, name: true, email: true, role: true, isActive: true, isVerified: true },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_USER',
        targetId: req.params.id,
        targetType: 'USER',
        metadata: JSON.stringify({ changes: { role, isActive, isVerified } }),
        actorId: req.user!.userId,
      },
    });

    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id
adminRouter.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    await prisma.auditLog.create({
      data: { action: 'USER_DELETED', targetType: 'USER', targetId: req.params.id, actorId: req.user!.userId },
    });
    res.json({ success: true, message: 'User deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// GET /api/admin/communities
adminRouter.get('/communities', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string;

    const where: any = {};
    if (status) where.status = status;

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          category: { select: { name: true } },
          _count: { select: { members: true, posts: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.community.count({ where }),
    ]);

    res.json({ success: true, data: communities, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch communities' });
  }
});

// PUT /api/admin/communities/:id
adminRouter.put('/communities/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { status, ...rest } = req.body;
    const community = await prisma.community.update({
      where: { id: req.params.id },
      data: { status, ...rest },
    });

    await prisma.auditLog.create({
      data: {
        action: `COMMUNITY_${status}`,
        targetType: 'COMMUNITY',
        targetId: req.params.id,
        actorId: req.user!.userId,
      },
    });

    // Notify community creator
    if (status === 'APPROVED' || status === 'REJECTED') {
      await prisma.notification.create({
        data: {
          type: status === 'APPROVED' ? 'JOIN_APPROVED' : 'JOIN_REJECTED',
          title: status === 'APPROVED' ? '🎉 Community Approved!' : 'Community Request Rejected',
          body: status === 'APPROVED'
            ? `Your community "${community.name}" has been approved and is now live!`
            : `Your community "${community.name}" request was not approved.`,
          receiverId: community.createdById,
          relatedId: community.id,
          relatedType: 'COMMUNITY',
        },
      });
    }

    res.json({ success: true, data: community });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update community' });
  }
});

// GET /api/admin/reports
adminRouter.get('/reports', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string;

    const where: any = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: { select: { id: true, name: true, email: true, profileImage: true } },
          reportedUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    res.json({ success: true, data: reports, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
});

// PUT /api/admin/reports/:id
adminRouter.put('/reports/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { status, adminNote } = req.body;
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { status, adminNote, reviewedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        action: `REPORT_${status}`,
        targetId: req.params.id,
        targetType: 'REPORT',
        metadata: JSON.stringify({ adminNote }),
        actorId: req.user!.userId,
      },
    });

    res.json({ success: true, data: report });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update report' });
  }
});

// GET /api/admin/audit-logs
adminRouter.get('/audit-logs', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const logs = await prisma.auditLog.findMany({
      include: { actor: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({ success: true, data: logs });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
});

// GET /api/admin/categories
adminRouter.get('/categories', async (_req, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { communities: true } } },
    });
    res.json({ success: true, data: categories });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// POST /api/admin/categories
adminRouter.post('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, icon, color } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = await prisma.category.create({ data: { name, slug, description, icon, color } });
    res.status(201).json({ success: true, data: category });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});
