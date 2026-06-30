import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPostSchema, updatePostSchema } from '../validators/schemas';
import { upload, uploadImage } from '../lib/upload';
import { io } from '../index';

export const postRouter = Router();

// GET /api/posts - Global feed
postRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const communityId = req.query.communityId as string;
    const type = req.query.type as string;

    // Get user's communities for personalized feed
    const userCommunities = await prisma.communityMember.findMany({
      where: { userId: req.user!.userId, status: 'APPROVED' },
      select: { communityId: true },
    });
    const communityIds = userCommunities.map(m => m.communityId);

    const where: any = {};
    if (communityId) {
      where.communityId = communityId;
    } else if (communityIds.length > 0) {
      where.OR = [
        { communityId: null },
        { communityId: { in: communityIds } },
      ];
    }
    if (type) where.type = type;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, username: true, profileImage: true } },
          community: { select: { id: true, name: true, slug: true, logoImage: true } },
          _count: { select: { likes: true, comments: true } },
          likes: {
            where: { userId: req.user!.userId },
            select: { userId: true },
          },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
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
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

// POST /api/posts - Create post
postRouter.post('/', authenticate, upload.array('images', 5), async (req: AuthRequest, res: Response) => {
  try {
    const { content, type, communityId } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Post content is required' });
      return;
    }

    // Upload images
    const imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const url = await uploadImage(file.path, 'posts');
        imageUrls.push(url);
      }
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        type: type || 'TEXT',
        images: JSON.stringify(imageUrls),
        authorId: req.user!.userId,
        communityId: communityId || null,
      },
      include: {
        author: { select: { id: true, name: true, username: true, profileImage: true } },
        community: { select: { id: true, name: true, slug: true } },
      },
    });

    if (communityId) {
      await prisma.community.update({
        where: { id: communityId },
        data: { postCount: { increment: 1 } },
      });
      // Broadcast to community room
      io.to(`community:${communityId}`).emit('post:new', post);
    }

    res.status(201).json({ success: true, message: 'Post created', data: post });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

// GET /api/posts/:id
postRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, username: true, profileImage: true } },
        community: { select: { id: true, name: true, slug: true } },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId: req.user!.userId }, select: { userId: true } },
      },
    });
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }

    res.json({
      success: true,
      data: { ...post, images: JSON.parse(post.images || '[]'), isLiked: post.likes.length > 0, likes: undefined },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch post' });
  }
});

// PUT /api/posts/:id
postRouter.put('/:id', authenticate, validate(updatePostSchema), async (req: AuthRequest, res: Response) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }
    if (post.authorId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized' }); return;
    }
    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: { content: req.body.content, isEdited: true },
    });
    res.json({ success: true, message: 'Post updated', data: updated });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update post' });
  }
});

// DELETE /api/posts/:id
postRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }
    
    const canDelete = post.authorId === req.user!.userId || req.user!.role === 'ADMIN';
    if (!canDelete) {
      // Check if moderator in community
      if (post.communityId) {
        const isMod = await prisma.communityMember.findFirst({
          where: { userId: req.user!.userId, communityId: post.communityId, role: { in: ['ADMIN', 'MODERATOR'] } },
        });
        if (!isMod) { res.status(403).json({ success: false, message: 'Not authorized' }); return; }
      } else {
        res.status(403).json({ success: false, message: 'Not authorized' }); return;
      }
    }

    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Post deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});

// POST /api/posts/:id/like
postRouter.post('/:id/like', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }

    const existing = await prisma.postLike.findUnique({
      where: { userId_postId: { userId: req.user!.userId, postId: id } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.postLike.delete({ where: { userId_postId: { userId: req.user!.userId, postId: id } } }),
        prisma.post.update({ where: { id }, data: { likeCount: { decrement: 1 } } }),
      ]);
      res.json({ success: true, message: 'Post unliked', data: { liked: false } });
    } else {
      await prisma.$transaction([
        prisma.postLike.create({ data: { userId: req.user!.userId, postId: id } }),
        prisma.post.update({ where: { id }, data: { likeCount: { increment: 1 } } }),
      ]);

      // Notify post author
      if (post.authorId !== req.user!.userId) {
        const liker = await prisma.user.findUnique({
          where: { id: req.user!.userId },
          select: { name: true },
        });
        const notification = await prisma.notification.create({
          data: {
            type: 'LIKE',
            title: 'New like',
            body: `${liker?.name} liked your post`,
            receiverId: post.authorId,
            senderId: req.user!.userId,
            relatedId: id,
            relatedType: 'POST',
          },
        });
        io.to(`user:${post.authorId}`).emit('notification:new', notification);
      }

      res.json({ success: true, message: 'Post liked', data: { liked: true } });
    }
  } catch {
    res.status(500).json({ success: false, message: 'Failed to like post' });
  }
});

// GET /api/posts/:id/comments
postRouter.get('/:id/comments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const comments = await prisma.comment.findMany({
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
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});

// POST /api/posts/:id/comments
postRouter.post('/:id/comments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content, parentId } = req.body;
    if (!content || content.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Comment cannot be empty' }); return;
    }

    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: req.user!.userId,
        postId: req.params.id,
        parentId: parentId || null,
      },
      include: {
        author: { select: { id: true, name: true, username: true, profileImage: true } },
      },
    });

    await prisma.post.update({
      where: { id: req.params.id },
      data: { commentCount: { increment: 1 } },
    });

    // Notify post author
    if (post.authorId !== req.user!.userId) {
      const commenter = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { name: true },
      });
      const notification = await prisma.notification.create({
        data: {
          type: 'COMMENT',
          title: 'New comment',
          body: `${commenter?.name} commented on your post`,
          receiverId: post.authorId,
          senderId: req.user!.userId,
          relatedId: req.params.id,
          relatedType: 'POST',
        },
      });
      io.to(`user:${post.authorId}`).emit('notification:new', notification);
    }

    res.status(201).json({ success: true, message: 'Comment added', data: comment });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
});

// POST /api/posts/:id/share
postRouter.post('/:id/share', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }
    await prisma.post.update({ where: { id: req.params.id }, data: { shareCount: { increment: 1 } } });
    res.json({ success: true, message: 'Post shared successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to share post' });
  }
});

// POST /api/posts/:id/pin (moderator only)
postRouter.post('/:id/pin', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }

    const canPin = req.user!.role === 'ADMIN' || (post.communityId && await prisma.communityMember.findFirst({
      where: { userId: req.user!.userId, communityId: post.communityId!, role: { in: ['ADMIN', 'MODERATOR'] } },
    }));

    if (!canPin) { res.status(403).json({ success: false, message: 'Not authorized to pin' }); return; }

    await prisma.post.update({ where: { id: req.params.id }, data: { isPinned: !post.isPinned } });
    res.json({ success: true, message: post.isPinned ? 'Post unpinned' : 'Post pinned' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to pin post' });
  }
});
