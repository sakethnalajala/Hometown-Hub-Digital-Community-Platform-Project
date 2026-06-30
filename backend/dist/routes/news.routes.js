"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.newsRouter = (0, express_1.Router)();
// GET /api/news
exports.newsRouter.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const category = req.query.category;
        const where = category ? { category } : {};
        const [news, total] = await Promise.all([
            prisma_1.prisma.newsArticle.findMany({
                where,
                include: {
                    author: { select: { id: true, name: true, profileImage: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.newsArticle.count({ where })
        ]);
        res.json({
            success: true,
            data: news,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch news' });
    }
});
// GET /api/news/:id
exports.newsRouter.get('/:id', async (req, res) => {
    try {
        const news = await prisma_1.prisma.newsArticle.update({
            where: { id: req.params.id },
            data: { views: { increment: 1 } },
            include: {
                author: { select: { id: true, name: true, profileImage: true } }
            }
        });
        if (!news) {
            res.status(404).json({ success: false, message: 'News not found' });
            return;
        }
        res.json({ success: true, data: news });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch news article' });
    }
});
// POST /api/news/:id/like
exports.newsRouter.post('/:id/like', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const news = await prisma_1.prisma.newsArticle.update({
            where: { id: req.params.id },
            data: { likes: { increment: 1 } }
        });
        res.json({ success: true, message: 'Liked news article', data: { likes: news.likes } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to like news article' });
    }
});
//# sourceMappingURL=news.routes.js.map