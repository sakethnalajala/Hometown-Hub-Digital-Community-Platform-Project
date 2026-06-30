import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';

export const tourismRouter = Router();

// GET /api/tourism
tourismRouter.get('/', async (req, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const type = req.query.type as string;
    
    const where = type ? { type } : {};

    const [places, total] = await Promise.all([
      prisma.tourismPlace.findMany({
        where,
        orderBy: { rating: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tourismPlace.count({ where })
    ]);

    const parsedPlaces = places.map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]')
    }));

    res.json({
      success: true,
      data: parsedPlaces,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tourism places' });
  }
});

// GET /api/tourism/:id
tourismRouter.get('/:id', async (req, res: Response) => {
  try {
    const place = await prisma.tourismPlace.findUnique({
      where: { id: req.params.id }
    });
    
    if (!place) {
      res.status(404).json({ success: false, message: 'Place not found' });
      return;
    }
    res.json({ 
      success: true, 
      data: {
        ...place,
        images: JSON.parse(place.images || '[]')
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch place' });
  }
});
