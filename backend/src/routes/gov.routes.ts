import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';

export const govRouter = Router();

// GET /api/gov
govRouter.get('/', async (req, res: Response) => {
  try {
    const category = req.query.category as string;
    const where = category ? { category } : {};

    const services = await prisma.govService.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch government services' });
  }
});

// GET /api/gov/:id
govRouter.get('/:id', async (req, res: Response) => {
  try {
    const service = await prisma.govService.findUnique({
      where: { id: req.params.id }
    });
    
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch service' });
  }
});
