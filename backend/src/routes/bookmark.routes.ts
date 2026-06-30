import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

export const bookmarkRouter = Router();

bookmarkRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const where: any = { userId: req.user!.userId };
    if (req.query.type) where.targetType = req.query.type;

    const bookmarks = await prisma.bookmark.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const enriched = await Promise.all(bookmarks.map(async (b) => {
      let item: any = null;
      if (b.targetType === 'jobs') item = await prisma.job.findUnique({ where: { id: b.targetId } });
      else if (b.targetType === 'news') item = await prisma.newsArticle.findUnique({ where: { id: b.targetId }, include: { author: { select: { id: true, name: true, profileImage: true } } } });
      else if (b.targetType === 'events') item = await prisma.event.findUnique({ where: { id: b.targetId } });
      else if (b.targetType === 'marketplace') item = await prisma.product.findUnique({ where: { id: b.targetId } });
      return { ...b, item };
    }));

    res.json({ success: true, data: enriched.filter((b) => b.item) });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch bookmarks' });
  }
});

bookmarkRouter.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId } = req.body;
    if (!targetType || !targetId) {
      res.status(400).json({ success: false, message: 'targetType and targetId required' });
      return;
    }

    const existing = await prisma.bookmark.findUnique({
      where: { userId_targetType_targetId: { userId: req.user!.userId, targetType, targetId } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      res.json({ success: true, message: 'Removed from saved', data: { saved: false } });
      return;
    }

    await prisma.bookmark.create({
      data: { userId: req.user!.userId, targetType, targetId },
    });
    res.json({ success: true, message: 'Saved successfully', data: { saved: true } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update bookmark' });
  }
});

bookmarkRouter.delete('/:type/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.bookmark.deleteMany({
      where: { userId: req.user!.userId, targetType: req.params.type, targetId: req.params.id },
    });
    res.json({ success: true, message: 'Removed from saved' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to remove bookmark' });
  }
});
