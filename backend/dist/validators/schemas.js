"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.createReportSchema = exports.rsvpSchema = exports.createEventSchema = exports.updateCommentSchema = exports.createCommentSchema = exports.updatePostSchema = exports.createPostSchema = exports.updateCommunitySchema = exports.createCommunitySchema = exports.updateProfileSchema = exports.refreshTokenSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// ============================================================
// AUTH SCHEMAS
// ============================================================
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(50),
        username: zod_1.z
            .string()
            .min(3, 'Username must be at least 3 characters')
            .max(30)
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        hometown: zod_1.z.string().optional(),
        currentCity: zod_1.z.string().optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(1),
        password: zod_1.z
            .string()
            .min(8)
            .regex(/(?=.*[A-Z])/)
            .regex(/(?=.*[0-9])/),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1),
    }),
});
// ============================================================
// USER SCHEMAS
// ============================================================
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(50).optional(),
        bio: zod_1.z.string().max(300).optional(),
        hometown: zod_1.z.string().max(100).optional(),
        currentCity: zod_1.z.string().max(100).optional(),
        phone: zod_1.z.string().optional(),
        interests: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
// ============================================================
// COMMUNITY SCHEMAS
// ============================================================
exports.createCommunitySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Community name must be at least 3 characters').max(80),
        description: zod_1.z.string().min(10, 'Description must be at least 10 characters').max(1000),
        city: zod_1.z.string().min(2).max(100),
        state: zod_1.z.string().optional(),
        country: zod_1.z.string().default('India'),
        categoryId: zod_1.z.string().optional(),
        isPrivate: zod_1.z.boolean().default(false),
        rules: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.updateCommunitySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3).max(80).optional(),
        description: zod_1.z.string().min(10).max(1000).optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        isPrivate: zod_1.z.boolean().optional(),
        rules: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
// ============================================================
// POST SCHEMAS
// ============================================================
exports.createPostSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Post content cannot be empty').max(5000),
        type: zod_1.z.enum(['TEXT', 'IMAGE', 'ANNOUNCEMENT']).default('TEXT'),
        communityId: zod_1.z.string().optional(),
        images: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.updatePostSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1).max(5000).optional(),
    }),
});
// ============================================================
// COMMENT SCHEMAS
// ============================================================
exports.createCommentSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Comment cannot be empty').max(1000),
        parentId: zod_1.z.string().optional(),
    }),
});
exports.updateCommentSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1).max(1000),
    }),
});
// ============================================================
// EVENT SCHEMAS
// ============================================================
exports.createEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).max(150),
        description: zod_1.z.string().min(10).max(2000),
        location: zod_1.z.string().min(1).max(200),
        address: zod_1.z.string().optional().nullable(),
        date: zod_1.z.string().min(1, 'Date is required'),
        endDate: zod_1.z.string().optional().nullable(),
        isOnline: zod_1.z.boolean().default(false),
        meetingLink: zod_1.z.string().optional().nullable(),
        maxParticipants: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform(Number)]).optional().nullable(),
        communityId: zod_1.z.string().optional().nullable(),
    }),
});
exports.rsvpSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['GOING', 'MAYBE', 'NOT_GOING']),
    }),
});
// ============================================================
// REPORT SCHEMAS
// ============================================================
exports.createReportSchema = zod_1.z.object({
    body: zod_1.z.object({
        reason: zod_1.z.string().min(5).max(200),
        description: zod_1.z.string().max(1000).optional(),
        contentType: zod_1.z.enum(['POST', 'COMMENT', 'USER', 'COMMUNITY', 'EVENT']),
        contentId: zod_1.z.string(),
        reportedUserId: zod_1.z.string().optional(),
    }),
});
// ============================================================
// PAGINATION SCHEMA
// ============================================================
exports.paginationSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 1),
        limit: zod_1.z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 20),
        cursor: zod_1.z.string().optional(),
    }),
});
//# sourceMappingURL=schemas.js.map