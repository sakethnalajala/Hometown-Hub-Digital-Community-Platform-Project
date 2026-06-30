import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

export const commentRouter = Router();

// PUT /api/comments/:id
commentRouter.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      res.status(400).json({ success: false, message: 'Comment cannot be empty' }); return;
    }
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) { res.status(404).json({ success: false, message: 'Comment not found' }); return; }
    if (comment.authorId !== req.user!.userId) {
      res.status(403).json({ success: false, message: 'Not authorized' }); return;
    }
    const updated = await prisma.comment.update({
      where: { id: req.params.id },
      data: { content: content.trim(), isEdited: true },
      include: { author: { select: { id: true, name: true, username: true, profileImage: true } } },
    });
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update comment' });
  }
});

// DELETE /api/comments/:id
commentRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) { res.status(404).json({ success: false, message: 'Comment not found' }); return; }
    if (comment.authorId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized' }); return;
    }
    await prisma.comment.delete({ where: { id: req.params.id } });
    await prisma.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    });
    res.json({ success: true, message: 'Comment deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
});

// POST /api/comments/:id/like
commentRouter.post('/:id/like', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId: req.user!.userId, commentId: id } },
    });
    if (existing) {
      await prisma.$transaction([
        prisma.commentLike.delete({ where: { userId_commentId: { userId: req.user!.userId, commentId: id } } }),
        prisma.comment.update({ where: { id }, data: { likeCount: { decrement: 1 } } }),
      ]);
      res.json({ success: true, data: { liked: false } });
    } else {
      await prisma.$transaction([
        prisma.commentLike.create({ data: { userId: req.user!.userId, commentId: id } }),
        prisma.comment.update({ where: { id }, data: { likeCount: { increment: 1 } } }),
      ]);
      res.json({ success: true, data: { liked: true } });
    }
  } catch {
    res.status(500).json({ success: false, message: 'Failed to like comment' });
  }
});

// GET /api/comments/:id/replies
commentRouter.get('/:id/replies', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 20);
    const replies = await prisma.comment.findMany({
      where: { parentId: req.params.id },
      include: { author: { select: { id: true, name: true, username: true, profileImage: true } } },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    res.json({ success: true, data: replies });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch replies' });
  }
});
