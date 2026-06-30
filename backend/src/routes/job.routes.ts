import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

export const jobRouter = Router();

// GET /api/jobs
jobRouter.get('/', async (req, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        include: {
          author: { select: { id: true, name: true, profileImage: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count()
    ]);

    // Parse JSON arrays for SQLite
    const parsedJobs = jobs.map(job => ({
      ...job,
      skills: JSON.parse(job.skills || '[]')
    }));

    res.json({
      success: true,
      data: parsedJobs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id
jobRouter.get('/:id', async (req, res: Response) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, profileImage: true, email: true } }
      }
    });
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }
    res.json({
      success: true,
      data: {
        ...job,
        skills: JSON.parse(job.skills || '[]')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch job' });
  }
});

// POST /api/jobs
jobRouter.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, company, companyLogo, salary, location, description, skills } = req.body;
    
    const job = await prisma.job.create({
      data: {
        title, company, companyLogo, salary, location, description,
        skills: JSON.stringify(skills || []),
        authorId: req.user!.userId
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Job created',
      data: {
        ...job,
        skills: JSON.parse(job.skills || '[]')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create job' });
  }
});

// POST /api/jobs/:id/apply
jobRouter.post('/:id/apply', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }
    res.json({ success: true, message: 'Application submitted successfully! The employer will contact you soon.' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
});
