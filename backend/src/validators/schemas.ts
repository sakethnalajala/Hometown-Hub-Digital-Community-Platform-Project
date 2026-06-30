import { z } from 'zod';

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
      .regex(/(?=.*[0-9])/, 'Password must contain at least one number'),
    hometown: z.string().optional(),
    currentCity: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8)
      .regex(/(?=.*[A-Z])/)
      .regex(/(?=.*[0-9])/),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

// ============================================================
// USER SCHEMAS
// ============================================================

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    bio: z.string().max(300).optional(),
    hometown: z.string().max(100).optional(),
    currentCity: z.string().max(100).optional(),
    phone: z.string().optional(),
    interests: z.array(z.string()).optional(),
  }),
});

// ============================================================
// COMMUNITY SCHEMAS
// ============================================================

export const createCommunitySchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Community name must be at least 3 characters').max(80),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
    city: z.string().min(2).max(100),
    state: z.string().optional(),
    country: z.string().default('India'),
    categoryId: z.string().optional(),
    isPrivate: z.boolean().default(false),
    rules: z.array(z.string()).optional(),
  }),
});

export const updateCommunitySchema = z.object({
  body: z.object({
    name: z.string().min(3).max(80).optional(),
    description: z.string().min(10).max(1000).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    isPrivate: z.boolean().optional(),
    rules: z.array(z.string()).optional(),
  }),
});

// ============================================================
// POST SCHEMAS
// ============================================================

export const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Post content cannot be empty').max(5000),
    type: z.enum(['TEXT', 'IMAGE', 'ANNOUNCEMENT']).default('TEXT'),
    communityId: z.string().optional(),
    images: z.array(z.string()).optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(5000).optional(),
  }),
});

// ============================================================
// COMMENT SCHEMAS
// ============================================================

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(1000),
    parentId: z.string().optional(),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(1000),
  }),
});

// ============================================================
// EVENT SCHEMAS
// ============================================================

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(150),
    description: z.string().min(10).max(2000),
    location: z.string().min(1).max(200),
    address: z.string().optional().nullable(),
    date: z.string().min(1, 'Date is required'),
    endDate: z.string().optional().nullable(),
    isOnline: z.boolean().default(false),
    meetingLink: z.string().optional().nullable(),
    maxParticipants: z.union([z.number(), z.string().transform(Number)]).optional().nullable(),
    communityId: z.string().optional().nullable(),
  }),
});

export const rsvpSchema = z.object({
  body: z.object({
    status: z.enum(['GOING', 'MAYBE', 'NOT_GOING']),
  }),
});

// ============================================================
// REPORT SCHEMAS
// ============================================================

export const createReportSchema = z.object({
  body: z.object({
    reason: z.string().min(5).max(200),
    description: z.string().max(1000).optional(),
    contentType: z.enum(['POST', 'COMMENT', 'USER', 'COMMUNITY', 'EVENT']),
    contentId: z.string(),
    reportedUserId: z.string().optional(),
  }),
});

// ============================================================
// PAGINATION SCHEMA
// ============================================================

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 20),
    cursor: z.string().optional(),
  }),
});
