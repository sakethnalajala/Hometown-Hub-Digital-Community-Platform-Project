"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoMockMiddleware = void 0;
const demoData_1 = require("../lib/demoData");
const demoContent_1 = require("../lib/demoContent");
const demoStore_1 = require("../lib/demoStore");
const demoMockData_1 = require("../lib/demoMockData");
const demoUsers_1 = require("../lib/demoUsers");
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
        catch { /* fall through */ }
    }
    return 'demo-user-001';
}
const demoMockMiddleware = (req, res, next) => {
    // Serve rich, STATEFUL demo data. Creates/updates/deletes persist for the
    // server's lifetime via demoStore, so the app behaves like a real backend.
    // Auth routes still pass through to the real auth handlers.
    if (req.path.startsWith('/auth'))
        return next();
    const userId = getUserId(req);
    const demoUser = (0, demoData_1.getDemoUserById)(userId) || (0, demoData_1.getDemoUserById)('demo-user-001');
    const path = req.path;
    const method = req.method;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    // ── Dashboard ──
    if (path === '/dashboard/analytics' && method === 'GET') {
        res.json({ success: true, data: demoContent_1.dashboardAnalytics });
        return;
    }
    // ── Bookmarks ──
    if (path === '/bookmarks' && method === 'GET') {
        res.json({ success: true, data: (0, demoContent_1.getBookmarks)(userId, req.query.type) });
        return;
    }
    if (path === '/bookmarks' && method === 'POST') {
        const { targetType, targetId } = req.body;
        const saved = (0, demoContent_1.toggleBookmark)(userId, targetType, targetId);
        res.json({ success: true, message: saved ? 'Saved successfully' : 'Removed from saved', data: { saved } });
        return;
    }
    if (path.match(/^\/bookmarks\/[^/]+\/[^/]+$/) && method === 'DELETE') {
        const [, , type, id] = path.split('/');
        (0, demoContent_1.toggleBookmark)(userId, type, id);
        res.json({ success: true, message: 'Removed from saved' });
        return;
    }
    // ── Users ──
    if (path === '/users/me' && method === 'GET') {
        res.json({ success: true, data: (0, demoMockData_1.buildDemoProfile)(userId) });
        return;
    }
    if (path === '/users/me' && method === 'PUT') {
        res.json({ success: true, message: 'Profile updated', data: { ...(0, demoMockData_1.buildDemoProfile)(userId), ...req.body } });
        return;
    }
    if ((path === '/users/me/avatar' || path === '/users/me/cover') && method === 'POST') {
        res.json({ success: true, message: 'Upload simulated', data: { profileImage: demoUser?.profileImage, coverImage: demoUser?.coverImage } });
        return;
    }
    if (path === '/users/me/bookmarks' && method === 'GET') {
        res.json({ success: true, data: (0, demoContent_1.getBookmarks)(userId, req.query.type) });
        return;
    }
    const userByIdMatch = path.match(/^\/users\/([^/]+)$/);
    if (userByIdMatch && method === 'GET' && !['search', 'me'].includes(userByIdMatch[1])) {
        res.json({ success: true, data: (0, demoMockData_1.buildDemoProfile)(userByIdMatch[1]) });
        return;
    }
    const userPostsMatch = path.match(/^\/users\/([^/]+)\/posts$/);
    if (userPostsMatch && method === 'GET') {
        const all = demoStore_1.postStore.list(userId);
        const filtered = all.filter((p) => p.authorId === userPostsMatch[1]);
        res.json({ success: true, ...paginate(filtered.length ? filtered : all.slice(0, 5), page, limit) });
        return;
    }
    const userCommunitiesMatch = path.match(/^\/users\/([^/]+)\/communities$/);
    if (userCommunitiesMatch && method === 'GET') {
        res.json({ success: true, data: demoStore_1.communityStore.list(userId).slice(0, 5) });
        return;
    }
    if (path === '/users/search/users' && method === 'GET') {
        res.json({ success: true, data: demoUsers_1.demoPeople.slice(0, 10) });
        return;
    }
    // ── Posts ──
    if (path === '/posts' && method === 'GET') {
        const list = demoStore_1.postStore.list(userId, { type: req.query.type });
        res.json({ success: true, ...paginate(list, page, limit) });
        return;
    }
    if (path === '/posts' && method === 'POST') {
        const post = demoStore_1.postStore.create(userId, req.body);
        res.status(201).json({ success: true, message: 'Post created', data: post });
        return;
    }
    const postMatch = path.match(/^\/posts\/([^/]+)$/);
    if (postMatch && method === 'GET') {
        const post = demoStore_1.postStore.get(userId, postMatch[1]);
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        res.json({ success: true, data: post });
        return;
    }
    if (postMatch && method === 'DELETE') {
        demoStore_1.postStore.remove(postMatch[1]);
        res.json({ success: true, message: 'Post deleted' });
        return;
    }
    if (path.match(/^\/posts\/[^/]+\/like$/) && method === 'POST') {
        res.json({ success: true, message: 'Post updated', data: demoStore_1.postStore.like(userId, path.split('/')[2]) });
        return;
    }
    if (path.match(/^\/posts\/[^/]+\/share$/) && method === 'POST') {
        res.json({ success: true, message: 'Post shared successfully' });
        return;
    }
    if (path.match(/^\/posts\/[^/]+\/comments$/) && method === 'GET') {
        res.json({ success: true, data: demoStore_1.postStore.getComments(path.split('/')[2]) });
        return;
    }
    if (path.match(/^\/posts\/[^/]+\/comments$/) && method === 'POST') {
        const comment = demoStore_1.postStore.addComment(userId, path.split('/')[2], req.body?.content);
        res.status(201).json({ success: true, message: 'Comment added', data: comment });
        return;
    }
    if (path.match(/^\/posts\/[^/]+\/(pin)$/) && method === 'POST') {
        res.json({ success: true, message: 'Post pinned' });
        return;
    }
    // ── Communities ──
    if (path === '/communities' && method === 'GET') {
        const list = demoStore_1.communityStore.list(userId, req.query.search);
        res.json({ success: true, ...paginate(list, page, limit) });
        return;
    }
    if (path === '/communities' && method === 'POST') {
        const community = demoStore_1.communityStore.create(userId, req.body);
        res.status(201).json({ success: true, message: 'Community created', data: community });
        return;
    }
    const communitySlugMatch = path.match(/^\/communities\/([^/]+)$/);
    if (communitySlugMatch && method === 'GET') {
        const comm = demoStore_1.communityStore.get(userId, communitySlugMatch[1]);
        if (!comm) {
            res.status(404).json({ success: false, message: 'Community not found' });
            return;
        }
        res.json({ success: true, data: comm });
        return;
    }
    if (communitySlugMatch && method === 'PUT') {
        const updated = demoStore_1.communityStore.update(communitySlugMatch[1], req.body);
        if (!updated) {
            res.status(404).json({ success: false, message: 'Community not found' });
            return;
        }
        res.json({ success: true, message: 'Community updated', data: updated });
        return;
    }
    if (communitySlugMatch && method === 'DELETE') {
        demoStore_1.communityStore.remove(communitySlugMatch[1]);
        res.json({ success: true, message: 'Community deleted' });
        return;
    }
    const communityPostsMatch = path.match(/^\/communities\/([^/]+)\/posts$/);
    if (communityPostsMatch && method === 'GET') {
        const comm = demoStore_1.communityStore.get(userId, communityPostsMatch[1]);
        const list = comm ? demoStore_1.postStore.list(userId, { communityId: comm.id }) : [];
        res.json({ success: true, ...paginate(list, page, limit) });
        return;
    }
    if (path.match(/^\/communities\/[^/]+\/join$/) && method === 'POST') {
        const comm = demoStore_1.communityStore.join(userId, path.split('/')[2]);
        res.json({ success: true, message: 'Joined community successfully', data: comm });
        return;
    }
    if (path.match(/^\/communities\/[^/]+\/leave$/) && method === 'DELETE') {
        demoStore_1.communityStore.leave(userId, path.split('/')[2]);
        res.json({ success: true, message: 'Left community' });
        return;
    }
    if (path.match(/^\/communities\/[^/]+\/members$/) && method === 'GET') {
        const comm = demoStore_1.communityStore.get(userId, path.split('/')[2]);
        res.json({ success: true, data: comm?.moderators || demoUsers_1.demoPeople.slice(0, 5).map((p) => ({ ...p, role: 'MEMBER' })) });
        return;
    }
    // ── Events ──
    if (path === '/events' && method === 'GET') {
        const list = demoStore_1.eventStore.list({ upcoming: req.query.upcoming === 'true', communityId: req.query.communityId });
        res.json({ success: true, ...paginate(list, page, limit) });
        return;
    }
    if (path === '/events' && method === 'POST') {
        const event = demoStore_1.eventStore.create(userId, req.body);
        res.status(201).json({ success: true, message: 'Event created', data: event });
        return;
    }
    const eventMatch = path.match(/^\/events\/([^/]+)$/);
    if (eventMatch && method === 'GET') {
        const event = demoStore_1.eventStore.get(eventMatch[1]);
        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found' });
            return;
        }
        res.json({ success: true, data: event });
        return;
    }
    if (eventMatch && method === 'PUT') {
        const updated = demoStore_1.eventStore.update(eventMatch[1], req.body);
        if (!updated) {
            res.status(404).json({ success: false, message: 'Event not found' });
            return;
        }
        res.json({ success: true, message: 'Event updated', data: updated });
        return;
    }
    if (eventMatch && method === 'DELETE') {
        demoStore_1.eventStore.remove(eventMatch[1]);
        res.json({ success: true, message: 'Event deleted' });
        return;
    }
    if (path.match(/^\/events\/[^/]+\/rsvp$/) && method === 'POST') {
        const result = demoStore_1.eventStore.rsvp(userId, path.split('/')[2], req.body?.status || 'GOING');
        res.json({ success: true, message: 'RSVP confirmed! You are registered for this event.', data: result });
        return;
    }
    if (path.match(/^\/events\/[^/]+\/participants$/) && method === 'GET') {
        res.json({ success: true, data: demoUsers_1.demoPeople.slice(0, 8).map((p) => ({ ...p, status: 'GOING' })) });
        return;
    }
    // ── Jobs ──
    if (path === '/jobs' && method === 'GET') {
        const list = demoStore_1.jobStore.list((req.query.q || req.query.search));
        res.json({ success: true, ...paginate(list, page, limit) });
        return;
    }
    if (path === '/jobs' && method === 'POST') {
        const job = demoStore_1.jobStore.create(userId, req.body);
        res.status(201).json({ success: true, message: 'Job posted', data: job });
        return;
    }
    const jobMatch = path.match(/^\/jobs\/([^/]+)$/);
    if (jobMatch && method === 'GET') {
        const job = demoStore_1.jobStore.get(jobMatch[1]);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }
        res.json({ success: true, data: job });
        return;
    }
    if (path.match(/^\/jobs\/[^/]+\/apply$/) && method === 'POST') {
        demoStore_1.jobStore.apply(path.split('/')[2]);
        res.json({ success: true, message: 'Application submitted successfully!' });
        return;
    }
    // ── News (read-only) ──
    if (path === '/news' && method === 'GET') {
        let list = [...demoContent_1.allNews];
        const cat = req.query.category;
        if (cat)
            list = list.filter((n) => n.category === cat);
        res.json({ success: true, ...paginate(list, page, limit) });
        return;
    }
    const newsMatch = path.match(/^\/news\/([^/]+)$/);
    if (newsMatch && method === 'GET') {
        const news = (0, demoContent_1.getNewsById)(newsMatch[1]);
        if (!news) {
            res.status(404).json({ success: false, message: 'Article not found' });
            return;
        }
        res.json({ success: true, data: news });
        return;
    }
    if (path.match(/^\/news\/[^/]+\/like$/) && method === 'POST') {
        res.json({ success: true, message: 'Article liked' });
        return;
    }
    if (path.match(/^\/news\/[^/]+\/share$/) && method === 'POST') {
        res.json({ success: true, message: 'Article shared' });
        return;
    }
    // ── Tourism (read-only) ──
    if (path === '/tourism' && method === 'GET') {
        let list = [...demoContent_1.allTourism];
        const type = req.query.type;
        if (type)
            list = list.filter((t) => t.type === type);
        res.json({ success: true, ...paginate(list, page, limit) });
        return;
    }
    const tourismMatch = path.match(/^\/tourism\/([^/]+)$/);
    if (tourismMatch && method === 'GET') {
        const t = (0, demoContent_1.getTourismById)(tourismMatch[1]);
        if (!t) {
            res.status(404).json({ success: false, message: 'Destination not found' });
            return;
        }
        res.json({ success: true, data: t });
        return;
    }
    // ── Gov (read-only) ──
    if (path === '/gov' && method === 'GET') {
        let list = [...demoContent_1.allGovServices];
        const cat = req.query.category;
        if (cat)
            list = list.filter((g) => g.category === cat);
        res.json({ success: true, data: list });
        return;
    }
    const govMatch = path.match(/^\/gov\/([^/]+)$/);
    if (govMatch && method === 'GET') {
        const g = (0, demoContent_1.getGovById)(govMatch[1]);
        if (!g) {
            res.status(404).json({ success: false, message: 'Service not found' });
            return;
        }
        res.json({ success: true, data: g });
        return;
    }
    // ── Marketplace ──
    if (path === '/marketplace' && method === 'GET') {
        const list = demoStore_1.productStore.list(req.query.category);
        res.json({ success: true, ...paginate(list, page, limit) });
        return;
    }
    if (path === '/marketplace' && method === 'POST') {
        const product = demoStore_1.productStore.create(userId, req.body);
        res.status(201).json({ success: true, message: 'Product listed', data: product });
        return;
    }
    const productMatch = path.match(/^\/marketplace\/([^/]+)$/);
    if (productMatch && method === 'GET') {
        const product = demoStore_1.productStore.get(productMatch[1]);
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.json({ success: true, data: product });
        return;
    }
    // ── Education (read-only) ──
    if (path === '/education/courses' && method === 'GET') {
        res.json({ success: true, data: demoContent_1.allCourses });
        return;
    }
    if (path === '/education/scholarships' && method === 'GET') {
        res.json({ success: true, data: demoContent_1.allScholarships });
        return;
    }
    // ── Healthcare (read-only) ──
    if (path === '/healthcare/hospitals' && method === 'GET') {
        res.json({ success: true, data: demoContent_1.allHospitals });
        return;
    }
    if (path === '/healthcare/schemes' && method === 'GET') {
        res.json({ success: true, data: demoContent_1.allHealthSchemes });
        return;
    }
    // ── Notifications ──
    if (path === '/notifications' && method === 'GET') {
        res.json({ success: true, data: (0, demoMockData_1.buildDemoNotifications)(userId) });
        return;
    }
    if (path.startsWith('/notifications') && method !== 'GET') {
        res.json({ success: true, message: 'Done' });
        return;
    }
    // ── Admin ──
    if (path === '/admin/analytics' && method === 'GET') {
        res.json({ success: true, data: demoContent_1.dashboardAnalytics });
        return;
    }
    if (path.startsWith('/admin')) {
        if (method === 'GET') {
            res.json({ success: true, ...paginate([], 1, 20) });
            return;
        }
        res.json({ success: true, message: 'Action simulated' });
        return;
    }
    // ── Comments (top-level) ──
    if (path.startsWith('/comments')) {
        if (method === 'GET') {
            res.json({ success: true, data: [] });
            return;
        }
        res.json({ success: true, message: 'Done' });
        return;
    }
    if (path.startsWith('/upload') || path.startsWith('/reports')) {
        res.json({ success: true, message: 'Done' });
        return;
    }
    // Fallback
    if (method === 'GET') {
        res.json({ success: true, data: [] });
        return;
    }
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        res.json({ success: true, message: 'Action completed in demo mode.' });
        return;
    }
    next();
};
exports.demoMockMiddleware = demoMockMiddleware;
//# sourceMappingURL=demoMock.middleware.js.map