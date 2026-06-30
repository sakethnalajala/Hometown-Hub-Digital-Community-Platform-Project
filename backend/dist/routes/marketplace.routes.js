"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketplaceRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.marketplaceRouter = (0, express_1.Router)();
// GET /api/marketplace
exports.marketplaceRouter.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const category = req.query.category;
        const where = category ? { category } : {};
        const [products, total] = await Promise.all([
            prisma_1.prisma.product.findMany({
                where,
                include: {
                    seller: { select: { id: true, name: true, profileImage: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.product.count({ where })
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});
// GET /api/marketplace/:id
exports.marketplaceRouter.get('/:id', async (req, res) => {
    try {
        const product = await prisma_1.prisma.product.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch product' });
    }
});
// POST /api/marketplace
exports.marketplaceRouter.post('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { name, description, price, category, images } = req.body;
        const product = await prisma_1.prisma.product.create({
            data: {
                name, description, price: parseFloat(price), category,
                images: JSON.stringify(images || []),
                sellerId: req.user.userId
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to list product' });
    }
});
//# sourceMappingURL=marketplace.routes.js.map