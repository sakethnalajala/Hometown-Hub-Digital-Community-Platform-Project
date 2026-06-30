import { DemoUser } from './demoData';
export declare const demoCommunities: {
    id: string;
    slug: string;
    name: string;
    description: string;
    city: string;
    categoryId: string;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    bannerImage: string;
    isPrivate: boolean;
    memberCount: number;
    postCount: number;
    createdAt: string;
    updatedAt: string;
    _count: {
        members: number;
        posts: number;
    };
}[];
export declare function buildDemoPosts(demoUser: DemoUser | undefined): {
    id: string;
    content: string;
    type: string;
    images: string[];
    authorId: string;
    communityId: string;
    createdAt: string;
    updatedAt: string;
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
    isPinned: boolean;
    author: {
        id: string;
        name: string;
        username: string;
        profileImage: string | undefined;
    };
    community: {
        id: string;
        name: string;
        slug: string;
    };
    _count: {
        likes: number;
        comments: number;
    };
}[];
export declare const demoEvents: {
    id: string;
    title: string;
    description: string;
    date: string;
    endDate: string;
    location: string;
    isOnline: boolean;
    status: string;
    bannerImage: string;
    communityId: string;
    organizerId: string;
    maxParticipants: number;
    community: {
        id: string;
        name: string;
        slug: string;
    };
    organizer: {
        id: string;
        name: string;
        username: string;
        profileImage: string;
    };
    _count: {
        participants: number;
    };
    createdAt: string;
}[];
export declare function buildDemoNotifications(userId: string): {
    id: string;
    type: string;
    title: string;
    body: string;
    isRead: boolean;
    userId: string;
    senderId: string;
    sender: {
        id: string;
        name: string;
        username: string;
        profileImage: string;
    };
    createdAt: string;
}[];
export declare function buildDemoProfile(userId: string): {
    passwordHash: undefined;
    _count: {
        posts: number;
        communityMemberships: number;
        organizedEvents: number;
    };
    id: string;
    email: string;
    name: string;
    username: string;
    phone?: string;
    profileImage?: string;
    coverImage?: string;
    bio?: string;
    hometown?: string;
    currentCity?: string;
    interests?: string[];
    role: "USER" | "MODERATOR" | "ADMIN";
    isVerified: boolean;
    isActive: boolean;
    lastSeen?: Date;
    createdAt: Date;
    updatedAt: Date;
};
export declare function getCommunityBySlug(slug: string): {
    id: string;
    slug: string;
    name: string;
    description: string;
    city: string;
    categoryId: string;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    bannerImage: string;
    isPrivate: boolean;
    memberCount: number;
    postCount: number;
    createdAt: string;
    updatedAt: string;
    _count: {
        members: number;
        posts: number;
    };
} | undefined;
export declare function getEventById(id: string): {
    id: string;
    title: string;
    description: string;
    date: string;
    endDate: string;
    location: string;
    isOnline: boolean;
    status: string;
    bannerImage: string;
    communityId: string;
    organizerId: string;
    maxParticipants: number;
    community: {
        id: string;
        name: string;
        slug: string;
    };
    organizer: {
        id: string;
        name: string;
        username: string;
        profileImage: string;
    };
    _count: {
        participants: number;
    };
    createdAt: string;
} | undefined;
//# sourceMappingURL=demoMockData.d.ts.map