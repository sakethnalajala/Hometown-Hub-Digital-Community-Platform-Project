import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReportSchema } from '../validators/schemas';

export const reportRouter = Router();

// POST /api/reports
reportRouter.post('/', authenticate, validate(createReportSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { reason, description, contentType, contentId, reportedUserId } = req.body;

    // Prevent duplicate reports
    const existing = await prisma.report.findFirst({
      where: { reporterId: req.user!.userId, contentType, contentId },
    });
    if (existing) {
      res.status(409).json({ success: false, message: 'You have already reported this content' }); return;
    }

    const report = await prisma.report.create({
      data: {
        reason, description, contentType, contentId,
        reportedUserId: reportedUserId || null,
        reporterId: req.user!.userId,
      },
    });

    res.status(201).json({ success: true, message: 'Report submitted successfully', data: report });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to submit report' });
  }
});
