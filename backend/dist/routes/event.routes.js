"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../validators/schemas");
const upload_1 = require("../lib/upload");
const index_1 = require("../index");
exports.eventRouter = (0, express_1.Router)();
// GET /api/events
exports.eventRouter.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const communityId = req.query.communityId;
        const status = req.query.status;
        const upcoming = req.query.upcoming === 'true';
        const where = {};
        if (communityId)
            where.communityId = communityId;
        if (status)
            where.status = status;
        if (upcoming)
            where.date = { gte: new Date() };
        const [events, total] = await Promise.all([
            prisma_1.prisma.event.findMany({
                where,
                include: {
                    organizer: { select: { id: true, name: true, username: true, profileImage: true } },
                    community: { select: { id: true, name: true, slug: true, logoImage: true } },
                    _count: { select: { participants: true } },
                },
                orderBy: { date: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.event.count({ where }),
        ]);
        res.json({
            success: true,
            data: events,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch events' });
    }
});
// POST /api/events
exports.eventRouter.post('/', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.createEventSchema), async (req, res) => {
    try {
        const { title, description, location, address, date, endDate, isOnline, meetingLink, maxParticipants, communityId } = req.body;
        const event = await prisma_1.prisma.event.create({
            data: {
                title, description, location, address,
                date: new Date(date),
                endDate: endDate ? new Date(endDate) : null,
                isOnline, meetingLink, maxParticipants,
                organizerId: req.user.userId,
                communityId: communityId || null,
            },
            include: {
                organizer: { select: { id: true, name: true, username: true, profileImage: true } },
                community: { select: { id: true, name: true, slug: true } },
            },
        });
        // Auto-RSVP organizer
        await prisma_1.prisma.eventParticipant.create({
            data: { userId: req.user.userId, eventId: event.id, status: 'GOING' },
        });
        res.status(201).json({ success: true, message: 'Event created', data: event });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to create event' });
    }
});
// GET /api/events/:id
exports.eventRouter.get('/:id', async (req, res) => {
    try {
        const event = await prisma_1.prisma.event.findUnique({
            where: { id: req.params.id },
            include: {
                organizer: { select: { id: true, name: true, username: true, profileImage: true } },
                community: { select: { id: true, name: true, slug: true, logoImage: true } },
                _count: { select: { participants: true } },
                participants: {
                    where: { status: 'GOING' },
                    include: { user: { select: { id: true, name: true, profileImage: true } } },
                    take: 10,
                },
            },
        });
        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found' });
            return;
        }
        res.json({ success: true, data: event });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch event' });
    }
});
// PUT /api/events/:id
exports.eventRouter.put('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const event = await prisma_1.prisma.event.findUnique({ where: { id: req.params.id } });
        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found' });
            return;
        }
        if (event.organizerId !== req.user.userId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        const updated = await prisma_1.prisma.event.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json({ success: true, data: updated });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update event' });
    }
});
// DELETE /api/events/:id
exports.eventRouter.delete('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const event = await prisma_1.prisma.event.findUnique({ where: { id: req.params.id } });
        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found' });
            return;
        }
        if (event.organizerId !== req.user.userId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        await prisma_1.prisma.event.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Event deleted' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to delete event' });
    }
});
// POST /api/events/:id/rsvp
exports.eventRouter.post('/:id/rsvp', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.rsvpSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const event = await prisma_1.prisma.event.findUnique({ where: { id } });
        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found' });
            return;
        }
        if (event.maxParticipants && status === 'GOING') {
            const count = await prisma_1.prisma.eventParticipant.count({ where: { eventId: id, status: 'GOING' } });
            if (count >= event.maxParticipants) {
                res.status(400).json({ success: false, message: 'Event is full' });
                return;
            }
        }
        const rsvp = await prisma_1.prisma.eventParticipant.upsert({
            where: { userId_eventId: { userId: req.user.userId, eventId: id } },
            update: { status },
            create: { userId: req.user.userId, eventId: id, status },
        });
        // Notify organizer
        if (event.organizerId !== req.user.userId && status === 'GOING') {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.user.userId },
                select: { name: true },
            });
            const notification = await prisma_1.prisma.notification.create({
                data: {
                    type: 'NEW_EVENT',
                    title: 'New RSVP',
                    body: `${user?.name} is going to your event "${event.title}"`,
                    receiverId: event.organizerId,
                    senderId: req.user.userId,
                    relatedId: id,
                    relatedType: 'EVENT',
                },
            });
            index_1.io.to(`user:${event.organizerId}`).emit('notification:new', notification);
        }
        res.json({ success: true, message: `RSVP updated to ${status}`, data: rsvp });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to RSVP' });
    }
});
// GET /api/events/:id/participants
exports.eventRouter.get('/:id/participants', async (req, res) => {
    try {
        const status = req.query.status;
        const participants = await prisma_1.prisma.eventParticipant.findMany({
            where: {
                eventId: req.params.id,
                ...(status ? { status: status } : {}),
            },
            include: {
                user: { select: { id: true, name: true, username: true, profileImage: true, hometown: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
        res.json({ success: true, data: participants });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch participants' });
    }
});
// POST /api/events/:id/banner
exports.eventRouter.post('/:id/banner', auth_middleware_1.authenticate, upload_1.upload.single('banner'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file' });
            return;
        }
        const imageUrl = await (0, upload_1.uploadImage)(req.file.path, 'events');
        await prisma_1.prisma.event.update({ where: { id: req.params.id }, data: { bannerImage: imageUrl } });
        res.json({ success: true, data: { bannerImage: imageUrl } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to upload banner' });
    }
});
//# sourceMappingURL=event.routes.js.map