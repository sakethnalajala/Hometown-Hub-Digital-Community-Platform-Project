import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createEventSchema, rsvpSchema } from '../validators/schemas';
import { upload, uploadImage } from '../lib/upload';
import { io } from '../index';

export const eventRouter = Router();

// GET /api/events
eventRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const communityId = req.query.communityId as string;
    const status = req.query.status as string;
    const upcoming = req.query.upcoming === 'true';

    const where: any = {};
    if (communityId) where.communityId = communityId;
    if (status) where.status = status;
    if (upcoming) where.date = { gte: new Date() };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
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
      prisma.event.count({ where }),
    ]);

    res.json({
      success: true,
      data: events,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// POST /api/events
eventRouter.post('/', authenticate, validate(createEventSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, address, date, endDate, isOnline, meetingLink, maxParticipants, communityId } = req.body;

    const event = await prisma.event.create({
      data: {
        title, description, location, address,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        isOnline, meetingLink, maxParticipants,
        organizerId: req.user!.userId,
        communityId: communityId || null,
      },
      include: {
        organizer: { select: { id: true, name: true, username: true, profileImage: true } },
        community: { select: { id: true, name: true, slug: true } },
      },
    });

    // Auto-RSVP organizer
    await prisma.eventParticipant.create({
      data: { userId: req.user!.userId, eventId: event.id, status: 'GOING' },
    });

    res.status(201).json({ success: true, message: 'Event created', data: event });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

// GET /api/events/:id
eventRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const event = await prisma.event.findUnique({
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
    if (!event) { res.status(404).json({ success: false, message: 'Event not found' }); return; }
    res.json({ success: true, data: event });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch event' });
  }
});

// PUT /api/events/:id
eventRouter.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) { res.status(404).json({ success: false, message: 'Event not found' }); return; }
    if (event.organizerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized' }); return;
    }
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update event' });
  }
});

// DELETE /api/events/:id
eventRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) { res.status(404).json({ success: false, message: 'Event not found' }); return; }
    if (event.organizerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized' }); return;
    }
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Event deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});

// POST /api/events/:id/rsvp
eventRouter.post('/:id/rsvp', authenticate, validate(rsvpSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) { res.status(404).json({ success: false, message: 'Event not found' }); return; }

    if (event.maxParticipants && status === 'GOING') {
      const count = await prisma.eventParticipant.count({ where: { eventId: id, status: 'GOING' } });
      if (count >= event.maxParticipants) {
        res.status(400).json({ success: false, message: 'Event is full' }); return;
      }
    }

    const rsvp = await prisma.eventParticipant.upsert({
      where: { userId_eventId: { userId: req.user!.userId, eventId: id } },
      update: { status },
      create: { userId: req.user!.userId, eventId: id, status },
    });

    // Notify organizer
    if (event.organizerId !== req.user!.userId && status === 'GOING') {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { name: true },
      });
      const notification = await prisma.notification.create({
        data: {
          type: 'NEW_EVENT',
          title: 'New RSVP',
          body: `${user?.name} is going to your event "${event.title}"`,
          receiverId: event.organizerId,
          senderId: req.user!.userId,
          relatedId: id,
          relatedType: 'EVENT',
        },
      });
      io.to(`user:${event.organizerId}`).emit('notification:new', notification);
    }

    res.json({ success: true, message: `RSVP updated to ${status}`, data: rsvp });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to RSVP' });
  }
});

// GET /api/events/:id/participants
eventRouter.get('/:id/participants', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const participants = await prisma.eventParticipant.findMany({
      where: {
        eventId: req.params.id,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        user: { select: { id: true, name: true, username: true, profileImage: true, hometown: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: participants });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch participants' });
  }
});

// POST /api/events/:id/banner
eventRouter.post('/:id/banner', authenticate, upload.single('banner'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file' }); return; }
    const imageUrl = await uploadImage(req.file.path, 'events');
    await prisma.event.update({ where: { id: req.params.id }, data: { bannerImage: imageUrl } });
    res.json({ success: true, data: { bannerImage: imageUrl } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to upload banner' });
  }
});
