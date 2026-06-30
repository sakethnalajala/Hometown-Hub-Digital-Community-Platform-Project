"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../validators/schemas");
const upload_1 = require("../lib/upload");
exports.userRouter = (0, express_1.Router)();
// GET /api/users/me
exports.userRouter.get('/me', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true, name: true, username: true, email: true, phone: true,
                profileImage: true, coverImage: true, bio: true, hometown: true,
                currentCity: true, interests: true, role: true, isVerified: true,
                lastSeen: true, createdAt: true,
                _count: { select: { communityMemberships: true, posts: true, organizedEvents: true } },
            },
        });
        res.json({ success: true, data: user });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
});
// PUT /api/users/me
exports.userRouter.put('/me', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.updateProfileSchema), async (req, res) => {
    try {
        const { name, bio, hometown, currentCity, phone, interests } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: req.user.userId },
            data: { name, bio, hometown, currentCity, phone, interests },
            select: {
                id: true, name: true, username: true, email: true, phone: true,
                profileImage: true, bio: true, hometown: true, currentCity: true, interests: true,
            },
        });
        res.json({ success: true, message: 'Profile updated', data: user });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});
// POST /api/users/me/avatar
exports.userRouter.post('/me/avatar', auth_middleware_1.authenticate, upload_1.upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file provided' });
            return;
        }
        const current = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { profileImage: true },
        });
        const imageUrl = await (0, upload_1.uploadImage)(req.file.path, 'avatars');
        if (current?.profileImage && current.profileImage.startsWith('/uploads')) {
            await (0, upload_1.deleteImage)(current.profileImage).catch(() => { });
        }
        await prisma_1.prisma.user.update({
            where: { id: req.user.userId },
            data: { profileImage: imageUrl },
        });
        res.json({ success: true, message: 'Avatar updated', data: { profileImage: imageUrl } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to upload avatar' });
    }
});
// POST /api/users/me/cover
exports.userRouter.post('/me/cover', auth_middleware_1.authenticate, upload_1.upload.single('cover'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file provided' });
            return;
        }
        const imageUrl = await (0, upload_1.uploadImage)(req.file.path, 'covers');
        await prisma_1.prisma.user.update({ where: { id: req.user.userId }, data: { coverImage: imageUrl } });
        res.json({ success: true, data: { coverImage: imageUrl } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to upload cover' });
    }
});
// GET /api/users/:id
exports.userRouter.get('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true, name: true, username: true, profileImage: true, coverImage: true,
                bio: true, hometown: true, currentCity: true, interests: true,
                isVerified: true, lastSeen: true, createdAt: true,
                _count: { select: { communityMemberships: true, posts: true } },
            },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
});
// GET /api/users/:id/posts
exports.userRouter.get('/:id/posts', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        const posts = await prisma_1.prisma.post.findMany({
            where: { authorId: req.params.id },
            include: {
                author: { select: { id: true, name: true, username: true, profileImage: true } },
                community: { select: { id: true, name: true, slug: true } },
                _count: { select: { likes: true, comments: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        const total = await prisma_1.prisma.post.count({ where: { authorId: req.params.id } });
        res.json({
            success: true,
            data: posts,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch posts' });
    }
});
// GET /api/users/:id/communities
exports.userRouter.get('/:id/communities', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const memberships = await prisma_1.prisma.communityMember.findMany({
            where: { userId: req.params.id, status: 'APPROVED' },
            include: {
                community: {
                    select: {
                        id: true, name: true, slug: true, description: true,
                        city: true, bannerImage: true, logoImage: true, memberCount: true,
                        category: { select: { name: true, icon: true } },
                    },
                },
            },
        });
        res.json({ success: true, data: memberships.map(m => m.community) });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch communities' });
    }
});
// GET /api/users/search
exports.userRouter.get('/search/users', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const q = req.query.q;
        if (!q || q.length < 2) {
            res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
            return;
        }
        const users = await prisma_1.prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { username: { contains: q } },
                    { hometown: { contains: q } },
                ],
            },
            select: {
                id: true, name: true, username: true, profileImage: true, hometown: true, currentCity: true,
            },
            take: 20,
        });
        res.json({ success: true, data: users });
    }
    catch {
        res.status(500).json({ success: false, message: 'Search failed' });
    }
});
//# sourceMappingURL=user.routes.js.map