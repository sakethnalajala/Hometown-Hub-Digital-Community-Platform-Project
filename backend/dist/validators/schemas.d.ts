import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        username: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
        hometown: z.ZodOptional<z.ZodString>;
        currentCity: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        username: string;
        password: string;
        hometown?: string | undefined;
        currentCity?: string | undefined;
    }, {
        name: string;
        email: string;
        username: string;
        password: string;
        hometown?: string | undefined;
        currentCity?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        email: string;
        username: string;
        password: string;
        hometown?: string | undefined;
        currentCity?: string | undefined;
    };
}, {
    body: {
        name: string;
        email: string;
        username: string;
        password: string;
        hometown?: string | undefined;
        currentCity?: string | undefined;
    };
}>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
    }, {
        email: string;
        password: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        password: string;
    };
}, {
    body: {
        email: string;
        password: string;
    };
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
    }, {
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
    };
}, {
    body: {
        email: string;
    };
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        token: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        token: string;
        password: string;
    }, {
        token: string;
        password: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        token: string;
        password: string;
    };
}, {
    body: {
        token: string;
        password: string;
    };
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    body: z.ZodObject<{
        refreshToken: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        refreshToken: string;
    }, {
        refreshToken: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        refreshToken: string;
    };
}, {
    body: {
        refreshToken: string;
    };
}>;
export declare const updateProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        hometown: z.ZodOptional<z.ZodString>;
        currentCity: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        interests: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        hometown?: string | undefined;
        currentCity?: string | undefined;
        bio?: string | undefined;
        phone?: string | undefined;
        interests?: string[] | undefined;
    }, {
        name?: string | undefined;
        hometown?: string | undefined;
        currentCity?: string | undefined;
        bio?: string | undefined;
        phone?: string | undefined;
        interests?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        hometown?: string | undefined;
        currentCity?: string | undefined;
        bio?: string | undefined;
        phone?: string | undefined;
        interests?: string[] | undefined;
    };
}, {
    body: {
        name?: string | undefined;
        hometown?: string | undefined;
        currentCity?: string | undefined;
        bio?: string | undefined;
        phone?: string | undefined;
        interests?: string[] | undefined;
    };
}>;
export declare const createCommunitySchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        country: z.ZodDefault<z.ZodString>;
        categoryId: z.ZodOptional<z.ZodString>;
        isPrivate: z.ZodDefault<z.ZodBoolean>;
        rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        city: string;
        country: string;
        isPrivate: boolean;
        state?: string | undefined;
        categoryId?: string | undefined;
        rules?: string[] | undefined;
    }, {
        name: string;
        description: string;
        city: string;
        state?: string | undefined;
        country?: string | undefined;
        categoryId?: string | undefined;
        isPrivate?: boolean | undefined;
        rules?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        description: string;
        city: string;
        country: string;
        isPrivate: boolean;
        state?: string | undefined;
        categoryId?: string | undefined;
        rules?: string[] | undefined;
    };
}, {
    body: {
        name: string;
        description: string;
        city: string;
        state?: string | undefined;
        country?: string | undefined;
        categoryId?: string | undefined;
        isPrivate?: boolean | undefined;
        rules?: string[] | undefined;
    };
}>;
export declare const updateCommunitySchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        isPrivate: z.ZodOptional<z.ZodBoolean>;
        rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        description?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        isPrivate?: boolean | undefined;
        rules?: string[] | undefined;
    }, {
        name?: string | undefined;
        description?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        isPrivate?: boolean | undefined;
        rules?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        description?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        isPrivate?: boolean | undefined;
        rules?: string[] | undefined;
    };
}, {
    body: {
        name?: string | undefined;
        description?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        isPrivate?: boolean | undefined;
        rules?: string[] | undefined;
    };
}>;
export declare const createPostSchema: z.ZodObject<{
    body: z.ZodObject<{
        content: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "ANNOUNCEMENT"]>>;
        communityId: z.ZodOptional<z.ZodString>;
        images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "TEXT" | "IMAGE" | "ANNOUNCEMENT";
        content: string;
        communityId?: string | undefined;
        images?: string[] | undefined;
    }, {
        content: string;
        type?: "TEXT" | "IMAGE" | "ANNOUNCEMENT" | undefined;
        communityId?: string | undefined;
        images?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        type: "TEXT" | "IMAGE" | "ANNOUNCEMENT";
        content: string;
        communityId?: string | undefined;
        images?: string[] | undefined;
    };
}, {
    body: {
        content: string;
        type?: "TEXT" | "IMAGE" | "ANNOUNCEMENT" | undefined;
        communityId?: string | undefined;
        images?: string[] | undefined;
    };
}>;
export declare const updatePostSchema: z.ZodObject<{
    body: z.ZodObject<{
        content: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        content?: string | undefined;
    }, {
        content?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        content?: string | undefined;
    };
}, {
    body: {
        content?: string | undefined;
    };
}>;
export declare const createCommentSchema: z.ZodObject<{
    body: z.ZodObject<{
        content: z.ZodString;
        parentId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        content: string;
        parentId?: string | undefined;
    }, {
        content: string;
        parentId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        content: string;
        parentId?: string | undefined;
    };
}, {
    body: {
        content: string;
        parentId?: string | undefined;
    };
}>;
export declare const updateCommentSchema: z.ZodObject<{
    body: z.ZodObject<{
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
    }, {
        content: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        content: string;
    };
}, {
    body: {
        content: string;
    };
}>;
export declare const createEventSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        location: z.ZodString;
        address: z.ZodOptional<z.ZodString>;
        date: z.ZodString;
        endDate: z.ZodOptional<z.ZodString>;
        isOnline: z.ZodDefault<z.ZodBoolean>;
        meetingLink: z.ZodOptional<z.ZodString>;
        maxParticipants: z.ZodOptional<z.ZodNumber>;
        communityId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        date: string;
        description: string;
        title: string;
        location: string;
        isOnline: boolean;
        communityId?: string | undefined;
        address?: string | undefined;
        endDate?: string | undefined;
        meetingLink?: string | undefined;
        maxParticipants?: number | undefined;
    }, {
        date: string;
        description: string;
        title: string;
        location: string;
        communityId?: string | undefined;
        address?: string | undefined;
        endDate?: string | undefined;
        isOnline?: boolean | undefined;
        meetingLink?: string | undefined;
        maxParticipants?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        date: string;
        description: string;
        title: string;
        location: string;
        isOnline: boolean;
        communityId?: string | undefined;
        address?: string | undefined;
        endDate?: string | undefined;
        meetingLink?: string | undefined;
        maxParticipants?: number | undefined;
    };
}, {
    body: {
        date: string;
        description: string;
        title: string;
        location: string;
        communityId?: string | undefined;
        address?: string | undefined;
        endDate?: string | undefined;
        isOnline?: boolean | undefined;
        meetingLink?: string | undefined;
        maxParticipants?: number | undefined;
    };
}>;
export declare const rsvpSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<["GOING", "MAYBE", "NOT_GOING"]>;
    }, "strip", z.ZodTypeAny, {
        status: "GOING" | "MAYBE" | "NOT_GOING";
    }, {
        status: "GOING" | "MAYBE" | "NOT_GOING";
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        status: "GOING" | "MAYBE" | "NOT_GOING";
    };
}, {
    body: {
        status: "GOING" | "MAYBE" | "NOT_GOING";
    };
}>;
export declare const createReportSchema: z.ZodObject<{
    body: z.ZodObject<{
        reason: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        contentType: z.ZodEnum<["POST", "COMMENT", "USER", "COMMUNITY", "EVENT"]>;
        contentId: z.ZodString;
        reportedUserId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reason: string;
        contentType: "POST" | "COMMENT" | "USER" | "COMMUNITY" | "EVENT";
        contentId: string;
        description?: string | undefined;
        reportedUserId?: string | undefined;
    }, {
        reason: string;
        contentType: "POST" | "COMMENT" | "USER" | "COMMUNITY" | "EVENT";
        contentId: string;
        description?: string | undefined;
        reportedUserId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        reason: string;
        contentType: "POST" | "COMMENT" | "USER" | "COMMUNITY" | "EVENT";
        contentId: string;
        description?: string | undefined;
        reportedUserId?: string | undefined;
    };
}, {
    body: {
        reason: string;
        contentType: "POST" | "COMMENT" | "USER" | "COMMUNITY" | "EVENT";
        contentId: string;
        description?: string | undefined;
        reportedUserId?: string | undefined;
    };
}>;
export declare const paginationSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        cursor: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        cursor?: string | undefined;
    }, {
        cursor?: string | undefined;
        page?: string | undefined;
        limit?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        cursor?: string | undefined;
    };
}, {
    query: {
        cursor?: string | undefined;
        page?: string | undefined;
        limit?: string | undefined;
    };
}>;
//# sourceMappingURL=schemas.d.ts.map