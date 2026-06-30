"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.adminRouter = (0, express_1.Router)();
// All admin routes require authentication + ADMIN role
exports.adminRouter.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'));
// GET /api/admin/analytics
exports.adminRouter.get('/analytics', async (_req, res) => {
    try {
        const [totalUsers, totalCommunities, totalPosts, totalEvents, newUsersToday, pendingCommunities, pendingReports, usersByMonth, postsByType,] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.community.count({ where: { status: 'APPROVED' } }),
            prisma_1.prisma.post.count(),
            prisma_1.prisma.event.count(),
            prisma_1.prisma.user.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
            prisma_1.prisma.community.count({ where: { status: 'PENDING' } }),
            prisma_1.prisma.report.count({ where: { status: 'PENDING' } }),
            prisma_1.prisma.user.groupBy({
                by: ['createdAt'],
                _count: true,
                orderBy: { createdAt: 'desc' },
                take: 30,
            }),
            prisma_1.prisma.post.groupBy({ by: ['type'], _count: true }),
        ]);
        res.json({
            success: true,
            data: {
                stats: { totalUsers, totalCommunities, totalPosts, totalEvents, newUsersToday, pendingCommunities, pendingReports },
                usersByMonth,
                postsByType,
            },
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
});
// GET /api/admin/users
exports.adminRouter.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const search = req.query.search;
        const role = req.query.role;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role)
            where.role = role;
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                select: {
                    id: true, name: true, username: true, email: true, role: true,
                    isActive: true, isVerified: true, hometown: true, createdAt: true,
                    _count: { select: { posts: true, communityMemberships: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        res.json({ success: true, data: users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});
// PUT /api/admin/users/:id
exports.adminRouter.put('/users/:id', async (req, res) => {
    try {
        const { role, isActive, isVerified } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: req.params.id },
            data: { role, isActive, isVerified },
            select: { id: true, name: true, email: true, role: true, isActive: true, isVerified: true },
        });
        // Log audit
        await prisma_1.prisma.auditLog.create({
            data: {
                action: 'UPDATE_USER',
                targetId: req.params.id,
                targetType: 'USER',
                metadata: JSON.stringify({ changes: { role, isActive, isVerified } }),
                actorId: req.user.userId,
            },
        });
        res.json({ success: true, data: user });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});
// DELETE /api/admin/users/:id
exports.adminRouter.delete('/users/:id', async (req, res) => {
    try {
        await prisma_1.prisma.user.delete({ where: { id: req.params.id } });
        await prisma_1.prisma.auditLog.create({
            data: { action: 'USER_DELETED', targetType: 'USER', targetId: req.params.id, actorId: req.user.userId },
        });
        res.json({ success: true, message: 'User deleted' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});
// GET /api/admin/communities
exports.adminRouter.get('/communities', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const status = req.query.status;
        const where = {};
        if (status)
            where.status = status;
        const [communities, total] = await Promise.all([
            prisma_1.prisma.community.findMany({
                where,
                include: {
                    createdBy: { select: { id: true, name: true, email: true } },
                    category: { select: { name: true } },
                    _count: { select: { members: true, posts: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.community.count({ where }),
        ]);
        res.json({ success: true, data: communities, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch communities' });
    }
});
// PUT /api/admin/communities/:id
exports.adminRouter.put('/communities/:id', async (req, res) => {
    try {
        const { status, ...rest } = req.body;
        const community = await prisma_1.prisma.community.update({
            where: { id: req.params.id },
            data: { status, ...rest },
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: `COMMUNITY_${status}`,
                targetType: 'COMMUNITY',
                targetId: req.params.id,
                actorId: req.user.userId,
            },
        });
        // Notify community creator
        if (status === 'APPROVED' || status === 'REJECTED') {
            await prisma_1.prisma.notification.create({
                data: {
                    type: status === 'APPROVED' ? 'JOIN_APPROVED' : 'JOIN_REJECTED',
                    title: status === 'APPROVED' ? '🎉 Community Approved!' : 'Community Request Rejected',
                    body: status === 'APPROVED'
                        ? `Your community "${community.name}" has been approved and is now live!`
                        : `Your community "${community.name}" request was not approved.`,
                    receiverId: community.createdById,
                    relatedId: community.id,
                    relatedType: 'COMMUNITY',
                },
            });
        }
        res.json({ success: true, data: community });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update community' });
    }
});
// GET /api/admin/reports
exports.adminRouter.get('/reports', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const status = req.query.status;
        const where = {};
        if (status)
            where.status = status;
        const [reports, total] = await Promise.all([
            prisma_1.prisma.report.findMany({
                where,
                include: {
                    reporter: { select: { id: true, name: true, email: true, profileImage: true } },
                    reportedUser: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.report.count({ where }),
        ]);
        res.json({ success: true, data: reports, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch reports' });
    }
});
// PUT /api/admin/reports/:id
exports.adminRouter.put('/reports/:id', async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        const report = await prisma_1.prisma.report.update({
            where: { id: req.params.id },
            data: { status, adminNote, reviewedAt: new Date() },
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: `REPORT_${status}`,
                targetId: req.params.id,
                targetType: 'REPORT',
                metadata: JSON.stringify({ adminNote }),
                actorId: req.user.userId,
            },
        });
        res.json({ success: true, data: report });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update report' });
    }
});
// GET /api/admin/audit-logs
exports.adminRouter.get('/audit-logs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const logs = await prisma_1.prisma.auditLog.findMany({
            include: { actor: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
        res.json({ success: true, data: logs });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
    }
});
// GET /api/admin/categories
exports.adminRouter.get('/categories', async (_req, res) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { communities: true } } },
        });
        res.json({ success: true, data: categories });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
});
// POST /api/admin/categories
exports.adminRouter.post('/categories', async (req, res) => {
    try {
        const { name, description, icon, color } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const category = await prisma_1.prisma.category.create({ data: { name, slug, description, icon, color } });
        res.status(201).json({ success: true, data: category });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to create category' });
    }
});
//# sourceMappingURL=admin.routes.js.map