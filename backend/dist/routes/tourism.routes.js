"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tourismRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
exports.tourismRouter = (0, express_1.Router)();
// GET /api/tourism
exports.tourismRouter.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const type = req.query.type;
        const where = type ? { type } : {};
        const [places, total] = await Promise.all([
            prisma_1.prisma.tourismPlace.findMany({
                where,
                orderBy: { rating: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.tourismPlace.count({ where })
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch tourism places' });
    }
});
// GET /api/tourism/:id
exports.tourismRouter.get('/:id', async (req, res) => {
    try {
        const place = await prisma_1.prisma.tourismPlace.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch place' });
    }
});
//# sourceMappingURL=tourism.routes.js.map