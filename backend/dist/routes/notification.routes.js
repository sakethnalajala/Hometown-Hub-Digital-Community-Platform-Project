"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
exports.createNotification = createNotification;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.notificationRouter = (0, express_1.Router)();
async function createNotification(data) {
    return prisma_1.prisma.notification.create({ data });
}
// GET /api/notifications
exports.notificationRouter.get('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const unreadOnly = req.query.unread === 'true';
        const where = { receiverId: req.user.userId };
        if (unreadOnly)
            where.isRead = false;
        const [notifications, total, unreadCount] = await Promise.all([
            prisma_1.prisma.notification.findMany({
                where,
                include: {
                    sender: { select: { id: true, name: true, profileImage: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.notification.count({ where }),
            prisma_1.prisma.notification.count({ where: { receiverId: req.user.userId, isRead: false } }),
        ]);
        res.json({
            success: true,
            data: notifications,
            unreadCount,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});
// PUT /api/notifications/:id/read
exports.notificationRouter.put('/:id/read', auth_middleware_1.authenticate, async (req, res) => {
    try {
        await prisma_1.prisma.notification.updateMany({
            where: { id: req.params.id, receiverId: req.user.userId },
            data: { isRead: true },
        });
        res.json({ success: true, message: 'Notification marked as read' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
});
// PUT /api/notifications/read-all
exports.notificationRouter.put('/read-all/mark', auth_middleware_1.authenticate, async (req, res) => {
    try {
        await prisma_1.prisma.notification.updateMany({
            where: { receiverId: req.user.userId, isRead: false },
            data: { isRead: true },
        });
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
});
// DELETE /api/notifications/:id
exports.notificationRouter.delete('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        await prisma_1.prisma.notification.deleteMany({
            where: { id: req.params.id, receiverId: req.user.userId },
        });
        res.json({ success: true, message: 'Notification deleted' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
});
// DELETE /api/notifications/clear-all
exports.notificationRouter.delete('/clear/all', auth_middleware_1.authenticate, async (req, res) => {
    try {
        await prisma_1.prisma.notification.deleteMany({ where: { receiverId: req.user.userId } });
        res.json({ success: true, message: 'All notifications cleared' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to clear notifications' });
    }
});
//# sourceMappingURL=notification.routes.js.map