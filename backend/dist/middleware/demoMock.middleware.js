"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoMockMiddleware = void 0;
const demoData_1 = require("../lib/demoData");
const demoMockData_1 = require("../lib/demoMockData");
const jwt_1 = require("../lib/jwt");
function paginate(items, page = 1, limit = 20) {
    const total = items.length;
    const start = (page - 1) * limit;
    return {
        data: items.slice(start, start + limit),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
}
function getUserId(req) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        try {
            const payload = (0, jwt_1.verifyAccessToken)(authHeader.split(' ')[1]);
            return payload.userId;
        }
        catch {
            // fall through
        }
    }
    return 'demo-user-001';
}
const demoMockMiddleware = (req, res, next) => {
    if (process.env.DATABASE_URL) {
        return next();
    }
    // Mounted at /api — paths are relative (e.g. /auth/login, /posts)
    if (req.path.startsWith('/auth')) {
        return next();
    }
    const userId = getUserId(req);
    const demoUser = (0, demoData_1.getDemoUserById)(userId) || (0, demoData_1.getDemoUserById)('demo-user-001');
    const path = req.path;
    const method = req.method;
    // GET /users/me
    if (path === '/users/me' && method === 'GET') {
        res.json({ success: true, data: (0, demoMockData_1.buildDemoProfile)(userId) });
        return;
    }
    // PUT /users/me
    if (path === '/users/me' && method === 'PUT') {
        res.json({ success: true, message: 'Profile updated', data: { ...(0, demoMockData_1.buildDemoProfile)(userId), ...req.body } });
        return;
    }
    // POST /users/me/avatar or /cover
    if ((path === '/users/me/avatar' || path === '/users/me/cover') && method === 'POST') {
        res.json({
            success: true,
            message: 'Upload simulated in demo mode',
            data: { profileImage: demoUser?.profileImage, coverImage: demoUser?.coverImage },
        });
        return;
    }
    // GET /users/:id
    const userByIdMatch = path.match(/^\/users\/([^/]+)$/);
    if (userByIdMatch && method === 'GET' && userByIdMatch[1] !== 'search') {
        const profile = (0, demoMockData_1.buildDemoProfile)(userByIdMatch[1]);
        res.json({ success: true, data: profile });
        return;
    }
    // GET /users/:id/posts
    const userPostsMatch = path.match(/^\/users\/([^/]+)\/posts$/);
    if (userPostsMatch && method === 'GET') {
        const posts = (0, demoMockData_1.buildDemoPosts)(demoUser).filter((p) => p.authorId === userPostsMatch[1]);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = paginate(posts.length ? posts : (0, demoMockData_1.buildDemoPosts)(demoUser).slice(0, 2), page, limit);
        res.json({ success: true, ...result });
        return;
    }
    // GET /users/:id/communities
    const userCommunitiesMatch = path.match(/^\/users\/([^/]+)\/communities$/);
    if (userCommunitiesMatch && method === 'GET') {
        res.json({ success: true, data: demoMockData_1.demoCommunities.slice(0, 3) });
        return;
    }
    // GET /users/search/users
    if (path === '/users/search/users' && method === 'GET') {
        res.json({
            success: true,
            data: [
                { id: 'user-002', name: 'Sarah Chen', username: 'sarahc', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
                { id: 'user-003', name: 'Mike Johnson', username: 'mikej', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike' },
            ],
        });
        return;
    }
    // GET /posts (feed)
    if (path === '/posts' && method === 'GET') {
        const type = req.query.type;
        let posts = (0, demoMockData_1.buildDemoPosts)(demoUser);
        if (type === 'ANNOUNCEMENT') {
            posts = posts.filter((p) => p.type === 'ANNOUNCEMENT');
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = paginate(posts, page, limit);
        res.json({ success: true, ...result });
        return;
    }
    // GET /posts/:id
    const postMatch = path.match(/^\/posts\/([^/]+)$/);
    if (postMatch && method === 'GET') {
        const post = (0, demoMockData_1.buildDemoPosts)(demoUser).find((p) => p.id === postMatch[1]) || (0, demoMockData_1.buildDemoPosts)(demoUser)[0];
        res.json({ success: true, data: post });
        return;
    }
    // POST /posts/:id/like, comments, etc.
    if (path.match(/^\/posts\/[^/]+\/(like|comments|pin)$/) && method === 'POST') {
        res.json({ success: true, message: 'Action simulated in demo mode.', data: {} });
        return;
    }
    // GET /posts/:id/comments
    if (path.match(/^\/posts\/[^/]+\/comments$/) && method === 'GET') {
        res.json({
            success: true,
            data: [
                {
                    id: 'comment-001',
                    content: 'Great post! Looking forward to the festival.',
                    authorId: 'user-002',
                    author: { id: 'user-002', name: 'Sarah Chen', username: 'sarahc', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
                    createdAt: new Date().toISOString(),
                    likeCount: 3,
                },
            ],
        });
        return;
    }
    // GET /communities
    if (path === '/communities' && method === 'GET') {
        let communities = [...demoMockData_1.demoCommunities];
        const search = req.query.search?.toLowerCase();
        if (search) {
            communities = communities.filter((c) => c.name.toLowerCase().includes(search) || c.description.toLowerCase().includes(search));
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = paginate(communities, page, limit);
        res.json({ success: true, ...result });
        return;
    }
    // POST /communities
    if (path === '/communities' && method === 'POST') {
        res.json({
            success: true,
            message: 'Community created in demo mode',
            data: { id: 'community-new', slug: 'new-community', ...req.body, memberCount: 1 },
        });
        return;
    }
    // GET /communities/:slug
    const communitySlugMatch = path.match(/^\/communities\/([^/]+)$/);
    if (communitySlugMatch && method === 'GET') {
        const community = (0, demoMockData_1.getCommunityBySlug)(communitySlugMatch[1]);
        if (community) {
            res.json({ success: true, data: community });
            return;
        }
    }
    // GET /communities/:id/posts
    const communityPostsMatch = path.match(/^\/communities\/([^/]+)\/posts$/);
    if (communityPostsMatch && method === 'GET') {
        const posts = (0, demoMockData_1.buildDemoPosts)(demoUser).filter((p) => p.communityId === communityPostsMatch[1]);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = paginate(posts.length ? posts : (0, demoMockData_1.buildDemoPosts)(demoUser).slice(0, 2), page, limit);
        res.json({ success: true, ...result });
        return;
    }
    // Community join/leave/members
    if (path.match(/^\/communities\/[^/]+\/(join|leave|banner|members)/)) {
        if (method === 'GET') {
            res.json({
                success: true,
                data: [{ id: demoUser?.id, name: demoUser?.name, username: demoUser?.username, role: 'MEMBER', profileImage: demoUser?.profileImage }],
            });
            return;
        }
        res.json({ success: true, message: 'Action simulated in demo mode.', data: {} });
        return;
    }
    // GET /events
    if (path === '/events' && method === 'GET') {
        let events = [...demoMockData_1.demoEvents];
        if (req.query.upcoming === 'true') {
            events = events.filter((e) => new Date(e.date) > new Date());
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = paginate(events, page, limit);
        res.json({ success: true, ...result });
        return;
    }
    // POST /events
    if (path === '/events' && method === 'POST') {
        res.json({ success: true, message: 'Event created in demo mode', data: { id: 'event-new', ...req.body } });
        return;
    }
    // GET /events/:id
    const eventMatch = path.match(/^\/events\/([^/]+)$/);
    if (eventMatch && method === 'GET') {
        const event = (0, demoMockData_1.getEventById)(eventMatch[1]) || demoMockData_1.demoEvents[0];
        res.json({ success: true, data: event });
        return;
    }
    // Event RSVP, participants, banner
    if (path.match(/^\/events\/[^/]+\/(rsvp|participants|banner)/)) {
        if (method === 'GET') {
            res.json({
                success: true,
                data: [{ id: demoUser?.id, name: demoUser?.name, username: demoUser?.username, status: 'GOING', profileImage: demoUser?.profileImage }],
            });
            return;
        }
        res.json({ success: true, message: 'Action simulated in demo mode.', data: {} });
        return;
    }
    // GET /notifications
    if (path === '/notifications' && method === 'GET') {
        res.json({ success: true, data: (0, demoMockData_1.buildDemoNotifications)(userId) });
        return;
    }
    // Notification mutations
    if (path.startsWith('/notifications') && method !== 'GET') {
        res.json({ success: true, message: 'Action simulated in demo mode.' });
        return;
    }
    // Admin routes
    if (path.startsWith('/admin')) {
        if (path === '/admin/analytics' && method === 'GET') {
            res.json({
                success: true,
                data: {
                    totalUsers: 1250,
                    totalCommunities: demoMockData_1.demoCommunities.length,
                    totalPosts: 42,
                    totalEvents: demoMockData_1.demoEvents.length,
                    activeUsers: 890,
                    newUsersThisWeek: 45,
                },
            });
            return;
        }
        if (method === 'GET') {
            const result = paginate([], 1, 20);
            res.json({ success: true, ...result });
            return;
        }
        res.json({ success: true, message: 'Action simulated in demo mode.', data: {} });
        return;
    }
    // Upload routes
    if (path.startsWith('/upload')) {
        res.json({ success: true, message: 'Upload simulated in demo mode', data: { url: demoUser?.profileImage } });
        return;
    }
    // Reports
    if (path.startsWith('/reports') && method === 'POST') {
        res.json({ success: true, message: 'Report submitted in demo mode.' });
        return;
    }
    // Comments
    if (path.startsWith('/comments')) {
        if (method === 'GET') {
            res.json({ success: true, data: [] });
            return;
        }
        res.json({ success: true, message: 'Action simulated in demo mode.', data: {} });
        return;
    }
    // Generic fallback — prevent Prisma crashes
    if (method === 'GET') {
        res.json({ success: true, data: [] });
        return;
    }
    if (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH') {
        res.json({ success: true, message: 'Action simulated in demo mode.', data: {} });
        return;
    }
    next();
};
exports.demoMockMiddleware = demoMockMiddleware;
//# sourceMappingURL=demoMock.middleware.js.map