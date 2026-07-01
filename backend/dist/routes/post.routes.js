"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../validators/schemas");
const upload_1 = require("../lib/upload");
const index_1 = require("../index");
exports.postRouter = (0, express_1.Router)();
// GET /api/posts - Global feed
exports.postRouter.get('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const communityId = req.query.communityId;
        const type = req.query.type;
        // Get user's communities for personalized feed
        const userCommunities = await prisma_1.prisma.communityMember.findMany({
            where: { userId: req.user.userId, status: 'APPROVED' },
            select: { communityId: true },
        });
        const communityIds = userCommunities.map(m => m.communityId);
        const where = {};
        if (communityId) {
            where.communityId = communityId;
        }
        else if (communityIds.length > 0) {
            where.OR = [
                { communityId: null },
                { communityId: { in: communityIds } },
            ];
        }
        if (type)
            where.type = type;
        const [posts, total] = await Promise.all([
            prisma_1.prisma.post.findMany({
                where,
                include: {
                    author: { select: { id: true, name: true, username: true, profileImage: true } },
                    community: { select: { id: true, name: true, slug: true, logoImage: true } },
                    _count: { select: { likes: true, comments: true } },
                    likes: {
                        where: { userId: req.user.userId },
                        select: { userId: true },
                    },
                },
                orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.post.count({ where }),
        ]);
        const postsWithLikeStatus = posts.map(post => ({
            ...post,
            images: JSON.parse(post.images || '[]'),
            isLiked: post.likes.length > 0,
            likes: undefined,
        }));
        res.json({
            success: true,
            data: postsWithLikeStatus,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch posts' });
    }
});
// POST /api/posts - Create post
exports.postRouter.post('/', auth_middleware_1.authenticate, upload_1.upload.array('images', 5), async (req, res) => {
    try {
        const { content, type, communityId } = req.body;
        if (!content || content.trim().length === 0) {
            res.status(400).json({ success: false, message: 'Post content is required' });
            return;
        }
        // Upload images
        const imageUrls = [];
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                const url = await (0, upload_1.uploadImage)(file.path, 'posts');
                imageUrls.push(url);
            }
        }
        const post = await prisma_1.prisma.post.create({
            data: {
                content: content.trim(),
                type: type || 'TEXT',
                images: JSON.stringify(imageUrls),
                authorId: req.user.userId,
                communityId: communityId || null,
            },
            include: {
                author: { select: { id: true, name: true, username: true, profileImage: true } },
                community: { select: { id: true, name: true, slug: true } },
            },
        });
        if (communityId) {
            await prisma_1.prisma.community.update({
                where: { id: communityId },
                data: { postCount: { increment: 1 } },
            });
            // Broadcast to community room
            index_1.io.to(`community:${communityId}`).emit('post:new', post);
        }
        res.status(201).json({ success: true, message: 'Post created', data: post });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to create post' });
    }
});
// GET /api/posts/:id
exports.postRouter.get('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const post = await prisma_1.prisma.post.findUnique({
            where: { id: req.params.id },
            include: {
                author: { select: { id: true, name: true, username: true, profileImage: true } },
                community: { select: { id: true, name: true, slug: true } },
                _count: { select: { likes: true, comments: true } },
                likes: { where: { userId: req.user.userId }, select: { userId: true } },
            },
        });
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        res.json({
            success: true,
            data: { ...post, images: JSON.parse(post.images || '[]'), isLiked: post.likes.length > 0, likes: undefined },
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch post' });
    }
});
// PUT /api/posts/:id
exports.postRouter.put('/:id', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.updatePostSchema), async (req, res) => {
    try {
        const post = await prisma_1.prisma.post.findUnique({ where: { id: req.params.id } });
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        if (post.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        const updated = await prisma_1.prisma.post.update({
            where: { id: req.params.id },
            data: { content: req.body.content, isEdited: true },
        });
        res.json({ success: true, message: 'Post updated', data: updated });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update post' });
    }
});
// DELETE /api/posts/:id
exports.postRouter.delete('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const post = await prisma_1.prisma.post.findUnique({ where: { id: req.params.id } });
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        const canDelete = post.authorId === req.user.userId || req.user.role === 'ADMIN';
        if (!canDelete) {
            // Check if moderator in community
            if (post.communityId) {
                const isMod = await prisma_1.prisma.communityMember.findFirst({
                    where: { userId: req.user.userId, communityId: post.communityId, role: { in: ['ADMIN', 'MODERATOR'] } },
                });
                if (!isMod) {
                    res.status(403).json({ success: false, message: 'Not authorized' });
                    return;
                }
            }
            else {
                res.status(403).json({ success: false, message: 'Not authorized' });
                return;
            }
        }
        await prisma_1.prisma.post.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Post deleted' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to delete post' });
    }
});
// POST /api/posts/:id/like
exports.postRouter.post('/:id/like', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const post = await prisma_1.prisma.post.findUnique({ where: { id } });
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        const existing = await prisma_1.prisma.postLike.findUnique({
            where: { userId_postId: { userId: req.user.userId, postId: id } },
        });
        if (existing) {
            await prisma_1.prisma.$transaction([
                prisma_1.prisma.postLike.delete({ where: { userId_postId: { userId: req.user.userId, postId: id } } }),
                prisma_1.prisma.post.update({ where: { id }, data: { likeCount: { decrement: 1 } } }),
            ]);
            res.json({ success: true, message: 'Post unliked', data: { liked: false } });
        }
        else {
            await prisma_1.prisma.$transaction([
                prisma_1.prisma.postLike.create({ data: { userId: req.user.userId, postId: id } }),
                prisma_1.prisma.post.update({ where: { id }, data: { likeCount: { increment: 1 } } }),
            ]);
            // Notify post author
            if (post.authorId !== req.user.userId) {
                const liker = await prisma_1.prisma.user.findUnique({
                    where: { id: req.user.userId },
                    select: { name: true },
                });
                const notification = await prisma_1.prisma.notification.create({
                    data: {
                        type: 'LIKE',
                        title: 'New like',
                        body: `${liker?.name} liked your post`,
                        receiverId: post.authorId,
                        senderId: req.user.userId,
                        relatedId: id,
                        relatedType: 'POST',
                    },
                });
                index_1.io.to(`user:${post.authorId}`).emit('notification:new', notification);
            }
            res.json({ success: true, message: 'Post liked', data: { liked: true } });
        }
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to like post' });
    }
});
// GET /api/posts/:id/comments
exports.postRouter.get('/:id/comments', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const comments = await prisma_1.prisma.comment.findMany({
            where: { postId: req.params.id, parentId: null },
            include: {
                author: { select: { id: true, name: true, username: true, profileImage: true } },
                replies: {
                    include: {
                        author: { select: { id: true, name: true, username: true, profileImage: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                    take: 5,
                },
                _count: { select: { replies: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
        res.json({ success: true, data: comments });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch comments' });
    }
});
// POST /api/posts/:id/comments
exports.postRouter.post('/:id/comments', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { content, parentId } = req.body;
        if (!content || content.trim().length === 0) {
            res.status(400).json({ success: false, message: 'Comment cannot be empty' });
            return;
        }
        const post = await prisma_1.prisma.post.findUnique({ where: { id: req.params.id } });
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        const comment = await prisma_1.prisma.comment.create({
            data: {
                content: content.trim(),
                authorId: req.user.userId,
                postId: req.params.id,
                parentId: parentId || null,
            },
            include: {
                author: { select: { id: true, name: true, username: true, profileImage: true } },
            },
        });
        await prisma_1.prisma.post.update({
            where: { id: req.params.id },
            data: { commentCount: { increment: 1 } },
        });
        // Notify post author
        if (post.authorId !== req.user.userId) {
            const commenter = await prisma_1.prisma.user.findUnique({
                where: { id: req.user.userId },
                select: { name: true },
            });
            const notification = await prisma_1.prisma.notification.create({
                data: {
                    type: 'COMMENT',
                    title: 'New comment',
                    body: `${commenter?.name} commented on your post`,
                    receiverId: post.authorId,
                    senderId: req.user.userId,
                    relatedId: req.params.id,
                    relatedType: 'POST',
                },
            });
            index_1.io.to(`user:${post.authorId}`).emit('notification:new', notification);
        }
        res.status(201).json({ success: true, message: 'Comment added', data: comment });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
});
// POST /api/posts/:id/share
exports.postRouter.post('/:id/share', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const post = await prisma_1.prisma.post.findUnique({ where: { id: req.params.id } });
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        await prisma_1.prisma.post.update({ where: { id: req.params.id }, data: { shareCount: { increment: 1 } } });
        res.json({ success: true, message: 'Post shared successfully' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to share post' });
    }
});
// POST /api/posts/:id/pin (moderator only)
exports.postRouter.post('/:id/pin', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const post = await prisma_1.prisma.post.findUnique({ where: { id: req.params.id } });
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        const canPin = req.user.role === 'ADMIN' || (post.communityId && await prisma_1.prisma.communityMember.findFirst({
            where: { userId: req.user.userId, communityId: post.communityId, role: { in: ['ADMIN', 'MODERATOR'] } },
        }));
        if (!canPin) {
            res.status(403).json({ success: false, message: 'Not authorized to pin' });
            return;
        }
        await prisma_1.prisma.post.update({ where: { id: req.params.id }, data: { isPinned: !post.isPinned } });
        res.json({ success: true, message: post.isPinned ? 'Post unpinned' : 'Post pinned' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to pin post' });
    }
});
//# sourceMappingURL=post.routes.js.map