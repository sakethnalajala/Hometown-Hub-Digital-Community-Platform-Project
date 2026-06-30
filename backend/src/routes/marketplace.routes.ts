import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

export const marketplaceRouter = Router();

// GET /api/marketplace
marketplaceRouter.get('/', async (req, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const category = req.query.category as string;
    
    const where = category ? { category } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          seller: { select: { id: true, name: true, profileImage: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where })
    ]);

    const parsedProducts = products.map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]')
    }));

    res.json({
      success: true,
      data: parsedProducts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// GET /api/marketplace/:id
marketplaceRouter.get('/:id', async (req, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { select: { id: true, name: true, profileImage: true, email: true } },
        reviews: {
          include: { author: { select: { id: true, name: true, profileImage: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ 
      success: true, 
      data: {
        ...product,
        images: JSON.parse(product.images || '[]')
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

// POST /api/marketplace
marketplaceRouter.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, category, images } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name, description, price: parseFloat(price), category,
        images: JSON.stringify(images || []),
        sellerId: req.user!.userId
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Product listed',
      data: {
        ...product,
        images: JSON.parse(product.images || '[]')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list product' });
  }
});
