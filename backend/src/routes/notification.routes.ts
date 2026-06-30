import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

export const notificationRouter = Router();

export async function createNotification(data: {
  type: any;
  title: string;
  body: string;
  receiverId: string;
  senderId?: string;
  relatedId?: string;
  relatedType?: string;
  actionUrl?: string;
}) {
  return prisma.notification.create({ data });
}

// GET /api/notifications
notificationRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const unreadOnly = req.query.unread === 'true';

    const where: any = { receiverId: req.user!.userId };
    if (unreadOnly) where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          sender: { select: { id: true, name: true, profileImage: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { receiverId: req.user!.userId, isRead: false } }),
    ]);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read
notificationRouter.put('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, receiverId: req.user!.userId },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

// PUT /api/notifications/read-all
notificationRouter.put('/read-all/mark', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { receiverId: req.user!.userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
});

// DELETE /api/notifications/:id
notificationRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.deleteMany({
      where: { id: req.params.id, receiverId: req.user!.userId },
    });
    res.json({ success: true, message: 'Notification deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

// DELETE /api/notifications/clear-all
notificationRouter.delete('/clear/all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.deleteMany({ where: { receiverId: req.user!.userId } });
    res.json({ success: true, message: 'All notifications cleared' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to clear notifications' });
  }
});
