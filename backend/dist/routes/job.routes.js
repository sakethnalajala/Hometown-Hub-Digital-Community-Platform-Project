"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.jobRouter = (0, express_1.Router)();
// GET /api/jobs
exports.jobRouter.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const [jobs, total] = await Promise.all([
            prisma_1.prisma.job.findMany({
                include: {
                    author: { select: { id: true, name: true, profileImage: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.job.count()
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
    }
});
// GET /api/jobs/:id
exports.jobRouter.get('/:id', async (req, res) => {
    try {
        const job = await prisma_1.prisma.job.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch job' });
    }
});
// POST /api/jobs
exports.jobRouter.post('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { title, company, companyLogo, salary, location, description, skills } = req.body;
        const job = await prisma_1.prisma.job.create({
            data: {
                title, company, companyLogo, salary, location, description,
                skills: JSON.stringify(skills || []),
                authorId: req.user.userId
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create job' });
    }
});
//# sourceMappingURL=job.routes.js.map