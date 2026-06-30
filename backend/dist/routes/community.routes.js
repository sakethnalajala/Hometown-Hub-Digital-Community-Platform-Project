"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../validators/schemas");
const upload_1 = require("../lib/upload");
exports.communityRouter = (0, express_1.Router)();
function generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
}
// GET /api/communities - Discover communities
exports.communityRouter.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const city = req.query.city;
        const categoryId = req.query.categoryId;
        const where = { status: 'APPROVED' };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (city)
            where.city = { contains: city, mode: 'insensitive' };
        if (categoryId)
            where.categoryId = categoryId;
        const [communities, total] = await Promise.all([
            prisma_1.prisma.community.findMany({
                where,
                include: {
                    category: { select: { name: true, icon: true, color: true } },
                    createdBy: { select: { id: true, name: true, profileImage: true } },
                    _count: { select: { members: true, posts: true } },
                },
                orderBy: { memberCount: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.prisma.community.count({ where }),
        ]);
        res.json({
            success: true,
            data: communities,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch communities' });
    }
});
// POST /api/communities - Create community
exports.communityRouter.post('/', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.createCommunitySchema), async (req, res) => {
    try {
        const { name, description, city, state, country, categoryId, isPrivate, rules } = req.body;
        const slug = generateSlug(name);
        const community = await prisma_1.prisma.community.create({
            data: {
                name, slug, description, city, state, country: country || 'India',
                categoryId, isPrivate, rules: rules || [],
                createdById: req.user.userId,
                status: req.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
            },
        });
        // Auto-join creator as admin
        await prisma_1.prisma.communityMember.create({
            data: {
                userId: req.user.userId,
                communityId: community.id,
                role: 'ADMIN',
                status: 'APPROVED',
            },
        });
        res.status(201).json({
            success: true,
            message: req.user.role === 'ADMIN'
                ? 'Community created successfully'
                : 'Community request submitted for review',
            data: community,
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to create community' });
    }
});
// GET /api/communities/:slug
exports.communityRouter.get('/:slug', async (req, res) => {
    try {
        const community = await prisma_1.prisma.community.findUnique({
            where: { slug: req.params.slug },
            include: {
                category: { select: { name: true, icon: true, color: true } },
                createdBy: { select: { id: true, name: true, username: true, profileImage: true } },
                _count: { select: { members: true, posts: true, events: true } },
            },
        });
        if (!community) {
            res.status(404).json({ success: false, message: 'Community not found' });
            return;
        }
        res.json({ success: true, data: community });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch community' });
    }
});
// PUT /api/communities/:id
exports.communityRouter.put('/:id', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.updateCommunitySchema), async (req, res) => {
    try {
        const { id } = req.params;
        const membership = await prisma_1.prisma.communityMember.findFirst({
            where: { userId: req.user.userId, communityId: id, role: { in: ['ADMIN', 'MODERATOR'] } },
        });
        if (!membership && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Not authorized to update this community' });
            return;
        }
        const updated = await prisma_1.prisma.community.update({
            where: { id },
            data: req.body,
        });
        res.json({ success: true, message: 'Community updated', data: updated });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update community' });
    }
});
// POST /api/communities/:id/banner
exports.communityRouter.post('/:id/banner', auth_middleware_1.authenticate, upload_1.upload.single('banner'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file provided' });
            return;
        }
        const imageUrl = await (0, upload_1.uploadImage)(req.file.path, 'banners');
        await prisma_1.prisma.community.update({ where: { id: req.params.id }, data: { bannerImage: imageUrl } });
        res.json({ success: true, data: { bannerImage: imageUrl } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to upload banner' });
    }
});
// POST /api/communities/:id/join
exports.communityRouter.post('/:id/join', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const community = await prisma_1.prisma.community.findUnique({ where: { id } });
        if (!community) {
            res.status(404).json({ success: false, message: 'Community not found' });
            return;
        }
        if (community.status !== 'APPROVED') {
            res.status(400).json({ success: false, message: 'Community is not available' });
            return;
        }
        const existing = await prisma_1.prisma.communityMember.findUnique({
            where: { userId_communityId: { userId: req.user.userId, communityId: id } },
        });
        if (existing) {
            res.status(409).json({ success: false, message: 'Already a member or request pending' });
            return;
        }
        const status = community.isPrivate ? 'PENDING' : 'APPROVED';
        await prisma_1.prisma.communityMember.create({
            data: { userId: req.user.userId, communityId: id, status },
        });
        if (status === 'APPROVED') {
            await prisma_1.prisma.community.update({
                where: { id },
                data: { memberCount: { increment: 1 } },
            });
        }
        res.json({
            success: true,
            message: community.isPrivate ? 'Join request sent' : 'Joined community successfully',
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to join community' });
    }
});
// DELETE /api/communities/:id/leave
exports.communityRouter.delete('/:id/leave', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const membership = await prisma_1.prisma.communityMember.findUnique({
            where: { userId_communityId: { userId: req.user.userId, communityId: id } },
        });
        if (!membership) {
            res.status(404).json({ success: false, message: 'Not a member' });
            return;
        }
        await prisma_1.prisma.communityMember.delete({
            where: { userId_communityId: { userId: req.user.userId, communityId: id } },
        });
        if (membership.status === 'APPROVED') {
            await prisma_1.prisma.community.update({ where: { id }, data: { memberCount: { decrement: 1 } } });
        }
        res.json({ success: true, message: 'Left community successfully' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to leave community' });
    }
});
// GET /api/communities/:id/members
exports.communityRouter.get('/:id/members', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const members = await prisma_1.prisma.communityMember.findMany({
            where: { communityId: req.params.id, status: 'APPROVED' },
            include: {
                user: { select: { id: true, name: true, username: true, profileImage: true, hometown: true } },
            },
            orderBy: { joinedAt: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
        });
        res.json({ success: true, data: members });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch members' });
    }
});
// GET /api/communities/:id/posts
exports.communityRouter.get('/:id/posts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const posts = await prisma_1.prisma.post.findMany({
            where: { communityId: req.params.id },
            include: {
                author: { select: { id: true, name: true, username: true, profileImage: true } },
                _count: { select: { likes: true, comments: true } },
            },
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
            skip: (page - 1) * limit,
            take: limit,
        });
        res.json({ success: true, data: posts });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch posts' });
    }
});
// PUT /api/communities/:id/members/:userId/role
exports.communityRouter.put('/:id/members/:userId/role', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { id, userId } = req.params;
        const { role } = req.body;
        const isAdmin = await prisma_1.prisma.communityMember.findFirst({
            where: { userId: req.user.userId, communityId: id, role: 'ADMIN' },
        });
        if (!isAdmin && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        await prisma_1.prisma.communityMember.update({
            where: { userId_communityId: { userId, communityId: id } },
            data: { role },
        });
        res.json({ success: true, message: 'Member role updated' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update role' });
    }
});
// DELETE /api/communities/:id/members/:userId
exports.communityRouter.delete('/:id/members/:userId', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { id, userId } = req.params;
        const isMod = await prisma_1.prisma.communityMember.findFirst({
            where: { userId: req.user.userId, communityId: id, role: { in: ['ADMIN', 'MODERATOR'] } },
        });
        if (!isMod && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        await prisma_1.prisma.communityMember.delete({
            where: { userId_communityId: { userId, communityId: id } },
        });
        await prisma_1.prisma.community.update({ where: { id }, data: { memberCount: { decrement: 1 } } });
        res.json({ success: true, message: 'Member removed' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to remove member' });
    }
});
//# sourceMappingURL=community.routes.js.map