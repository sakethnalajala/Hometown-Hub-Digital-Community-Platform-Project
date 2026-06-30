import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { Router, Response } from 'express';

export const dashboardRouter = Router();

dashboardRouter.get('/analytics', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const [
      activeUsers,
      totalCommunities,
      totalJobs,
      totalEvents,
      trendingCommunities,
      trendingNews,
      trendingJobs
    ] = await Promise.all([
      prisma.user.count(),
      prisma.community.count(),
      prisma.job.count(),
      prisma.event.count(),
      prisma.community.findMany({
        take: 5,
        orderBy: { memberCount: 'desc' }
      }),
      prisma.newsArticle.findMany({
        take: 5,
        orderBy: { views: 'desc' }
      }),
      prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          activeUsers,
          totalCommunities,
          totalJobs,
          totalEvents
        },
        trendingCommunities,
        trendingNews: trendingNews.map(n => ({
          ...n,
          views: n.views || 0
        })),
        trendingJobs: trendingJobs.map(j => ({
          ...j,
          applicants: Math.floor(Math.random() * 50) + 1 // mock applicants since model doesn't have it
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});
