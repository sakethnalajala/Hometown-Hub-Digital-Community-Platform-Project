"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.govRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
exports.govRouter = (0, express_1.Router)();
// GET /api/gov
exports.govRouter.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        const where = category ? { category } : {};
        const services = await prisma_1.prisma.govService.findMany({
            where,
            orderBy: { name: 'asc' },
        });
        res.json({ success: true, data: services });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch government services' });
    }
});
// GET /api/gov/:id
exports.govRouter.get('/:id', async (req, res) => {
    try {
        const service = await prisma_1.prisma.govService.findUnique({
            where: { id: req.params.id }
        });
        if (!service) {
            res.status(404).json({ success: false, message: 'Service not found' });
            return;
        }
        res.json({ success: true, data: service });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch service' });
    }
});
//# sourceMappingURL=gov.routes.js.map