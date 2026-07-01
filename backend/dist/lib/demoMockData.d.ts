export { allCommunities as demoCommunities, allEvents as demoEvents, buildAllPosts as buildDemoPosts, buildCommentsForPost, getCommunityBySlug, getCommunityById, getEventById, dashboardAnalytics, } from './demoContent';
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
//# sourceMappingURL=demoMockData.d.ts.map