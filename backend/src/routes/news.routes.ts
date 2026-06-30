import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

export const newsRouter = Router();

// GET /api/news
newsRouter.get('/', async (req, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const category = req.query.category as string;

    const where = category ? { category } : {};

    const [news, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, profileImage: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.newsArticle.count({ where }),
    ]);

    res.json({
      success: true,
      data: news,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch news' });
  }
});

// GET /api/news/:id
newsRouter.get('/:id', async (req, res: Response) => {
  try {
    const news = await prisma.newsArticle.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
      },
    });

    if (!news) {
      res.status(404).json({ success: false, message: 'News not found' });
      return;
    }
    res.json({ success: true, data: news });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch news article' });
  }
});

// POST /api/news/:id/like
newsRouter.post('/:id/like', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const news = await prisma.newsArticle.update({
      where: { id: req.params.id },
      data: { likes: { increment: 1 } },
    });
    res.json({ success: true, message: 'Liked news article', data: { likes: news.likes } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to like news article' });
  }
});

// POST /api/news/:id/share
newsRouter.post('/:id/share', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, message: 'Article shared successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to share article' });
  }
});
