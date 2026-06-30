"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.commentRouter = (0, express_1.Router)();
// PUT /api/comments/:id
exports.commentRouter.put('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content?.trim()) {
            res.status(400).json({ success: false, message: 'Comment cannot be empty' });
            return;
        }
        const comment = await prisma_1.prisma.comment.findUnique({ where: { id: req.params.id } });
        if (!comment) {
            res.status(404).json({ success: false, message: 'Comment not found' });
            return;
        }
        if (comment.authorId !== req.user.userId) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        const updated = await prisma_1.prisma.comment.update({
            where: { id: req.params.id },
            data: { content: content.trim(), isEdited: true },
            include: { author: { select: { id: true, name: true, username: true, profileImage: true } } },
        });
        res.json({ success: true, data: updated });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update comment' });
    }
});
// DELETE /api/comments/:id
exports.commentRouter.delete('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const comment = await prisma_1.prisma.comment.findUnique({ where: { id: req.params.id } });
        if (!comment) {
            res.status(404).json({ success: false, message: 'Comment not found' });
            return;
        }
        if (comment.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        await prisma_1.prisma.comment.delete({ where: { id: req.params.id } });
        await prisma_1.prisma.post.update({
            where: { id: comment.postId },
            data: { commentCount: { decrement: 1 } },
        });
        res.json({ success: true, message: 'Comment deleted' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to delete comment' });
    }
});
// POST /api/comments/:id/like
exports.commentRouter.post('/:id/like', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma_1.prisma.commentLike.findUnique({
            where: { userId_commentId: { userId: req.user.userId, commentId: id } },
        });
        if (existing) {
            await prisma_1.prisma.$transaction([
                prisma_1.prisma.commentLike.delete({ where: { userId_commentId: { userId: req.user.userId, commentId: id } } }),
                prisma_1.prisma.comment.update({ where: { id }, data: { likeCount: { decrement: 1 } } }),
            ]);
            res.json({ success: true, data: { liked: false } });
        }
        else {
            await prisma_1.prisma.$transaction([
                prisma_1.prisma.commentLike.create({ data: { userId: req.user.userId, commentId: id } }),
                prisma_1.prisma.comment.update({ where: { id }, data: { likeCount: { increment: 1 } } }),
            ]);
            res.json({ success: true, data: { liked: true } });
        }
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to like comment' });
    }
});
// GET /api/comments/:id/replies
exports.commentRouter.get('/:id/replies', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 20);
        const replies = await prisma_1.prisma.comment.findMany({
            where: { parentId: req.params.id },
            include: { author: { select: { id: true, name: true, username: true, profileImage: true } } },
            orderBy: { createdAt: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
        });
        res.json({ success: true, data: replies });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch replies' });
    }
});
//# sourceMappingURL=comment.routes.js.map