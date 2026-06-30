import { Request, Response, NextFunction } from 'express';
import { getDemoUserById } from '../lib/demoData';
import {
  allCourses,
  allGovServices,
  allHealthSchemes,
  allHospitals,
  allNews,
  allScholarships,
  allTourism,
  dashboardAnalytics,
  getBookmarks,
  getGovById,
  getNewsById,
  getTourismById,
  toggleBookmark,
} from '../lib/demoContent';
import {
  communityStore, eventStore, postStore, jobStore, productStore,
} from '../lib/demoStore';
import { buildDemoNotifications, buildDemoProfile } from '../lib/demoMockData';
import { demoPeople } from '../lib/demoUsers';
import { JwtPayload, verifyAccessToken } from '../lib/jwt';

function paginate<T>(items: T[], page = 1, limit = 20) {
  const total = items.length;
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

function getUserId(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(authHeader.split(' ')[1]) as JwtPayload;
      return payload.userId;
    } catch { /* fall through */ }
  }
  return 'demo-user-001';
}

export const demoMockMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Serve rich, STATEFUL demo data. Creates/updates/deletes persist for the
  // server's lifetime via demoStore, so the app behaves like a real backend.
  // Auth routes still pass through to the real auth handlers.
  if (req.path.startsWith('/auth')) return next();

  const userId = getUserId(req);
  const demoUser = getDemoUserById(userId) || getDemoUserById('demo-user-001');
  const path = req.path;
  const method = req.method;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  // ── Dashboard ──
  if (path === '/dashboard/analytics' && method === 'GET') {
    res.json({ success: true, data: dashboardAnalytics });
    return;
  }

  // ── Bookmarks ──
  if (path === '/bookmarks' && method === 'GET') {
    res.json({ success: true, data: getBookmarks(userId, req.query.type as string | undefined) });
    return;
  }
  if (path === '/bookmarks' && method === 'POST') {
    const { targetType, targetId } = req.body;
    const saved = toggleBookmark(userId, targetType, targetId);
    res.json({ success: true, message: saved ? 'Saved successfully' : 'Removed from saved', data: { saved } });
    return;
  }
  if (path.match(/^\/bookmarks\/[^/]+\/[^/]+$/) && method === 'DELETE') {
    const [, , type, id] = path.split('/');
    toggleBookmark(userId, type, id);
    res.json({ success: true, message: 'Removed from saved' });
    return;
  }

  // ── Users ──
  if (path === '/users/me' && method === 'GET') {
    res.json({ success: true, data: buildDemoProfile(userId) });
    return;
  }
  if (path === '/users/me' && method === 'PUT') {
    res.json({ success: true, message: 'Profile updated', data: { ...buildDemoProfile(userId), ...req.body } });
    return;
  }
  if ((path === '/users/me/avatar' || path === '/users/me/cover') && method === 'POST') {
    res.json({ success: true, message: 'Upload simulated', data: { profileImage: demoUser?.profileImage, coverImage: demoUser?.coverImage } });
    return;
  }
  if (path === '/users/me/bookmarks' && method === 'GET') {
    res.json({ success: true, data: getBookmarks(userId, req.query.type as string) });
    return;
  }

  const userByIdMatch = path.match(/^\/users\/([^/]+)$/);
  if (userByIdMatch && method === 'GET' && !['search', 'me'].includes(userByIdMatch[1])) {
    res.json({ success: true, data: buildDemoProfile(userByIdMatch[1]) });
    return;
  }

  const userPostsMatch = path.match(/^\/users\/([^/]+)\/posts$/);
  if (userPostsMatch && method === 'GET') {
    const all = postStore.list(userId);
    const filtered = all.filter((p) => p.authorId === userPostsMatch[1]);
    res.json({ success: true, ...paginate(filtered.length ? filtered : all.slice(0, 5), page, limit) });
    return;
  }

  const userCommunitiesMatch = path.match(/^\/users\/([^/]+)\/communities$/);
  if (userCommunitiesMatch && method === 'GET') {
    res.json({ success: true, data: communityStore.list(userId).slice(0, 5) });
    return;
  }

  if (path === '/users/search/users' && method === 'GET') {
    res.json({ success: true, data: demoPeople.slice(0, 10) });
    return;
  }

  // ── Posts ──
  if (path === '/posts' && method === 'GET') {
    const list = postStore.list(userId, { type: req.query.type as string });
    res.json({ success: true, ...paginate(list, page, limit) });
    return;
  }
  if (path === '/posts' && method === 'POST') {
    const post = postStore.create(userId, req.body);
    res.status(201).json({ success: true, message: 'Post created', data: post });
    return;
  }

  const postMatch = path.match(/^\/posts\/([^/]+)$/);
  if (postMatch && method === 'GET') {
    const post = postStore.get(userId, postMatch[1]);
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }
    res.json({ success: true, data: post });
    return;
  }
  if (postMatch && method === 'DELETE') {
    postStore.remove(postMatch[1]);
    res.json({ success: true, message: 'Post deleted' });
    return;
  }
  if (path.match(/^\/posts\/[^/]+\/like$/) && method === 'POST') {
    res.json({ success: true, message: 'Post updated', data: postStore.like(userId, path.split('/')[2]) });
    return;
  }
  if (path.match(/^\/posts\/[^/]+\/share$/) && method === 'POST') {
    res.json({ success: true, message: 'Post shared successfully' });
    return;
  }
  if (path.match(/^\/posts\/[^/]+\/comments$/) && method === 'GET') {
    res.json({ success: true, data: postStore.getComments(path.split('/')[2]) });
    return;
  }
  if (path.match(/^\/posts\/[^/]+\/comments$/) && method === 'POST') {
    const comment = postStore.addComment(userId, path.split('/')[2], req.body?.content);
    res.status(201).json({ success: true, message: 'Comment added', data: comment });
    return;
  }
  if (path.match(/^\/posts\/[^/]+\/(pin)$/) && method === 'POST') {
    res.json({ success: true, message: 'Post pinned' });
    return;
  }

  // ── Communities ──
  if (path === '/communities' && method === 'GET') {
    const list = communityStore.list(userId, req.query.search as string);
    res.json({ success: true, ...paginate(list, page, limit) });
    return;
  }
  if (path === '/communities' && method === 'POST') {
    const community = communityStore.create(userId, req.body);
    res.status(201).json({ success: true, message: 'Community created', data: community });
    return;
  }

  const communitySlugMatch = path.match(/^\/communities\/([^/]+)$/);
  if (communitySlugMatch && method === 'GET') {
    const comm = communityStore.get(userId, communitySlugMatch[1]);
    if (!comm) { res.status(404).json({ success: false, message: 'Community not found' }); return; }
    res.json({ success: true, data: comm });
    return;
  }
  if (communitySlugMatch && method === 'PUT') {
    const updated = communityStore.update(communitySlugMatch[1], req.body);
    if (!updated) { res.status(404).json({ success: false, message: 'Community not found' }); return; }
    res.json({ success: true, message: 'Community updated', data: updated });
    return;
  }
  if (communitySlugMatch && method === 'DELETE') {
    communityStore.remove(communitySlugMatch[1]);
    res.json({ success: true, message: 'Community deleted' });
    return;
  }

  const communityPostsMatch = path.match(/^\/communities\/([^/]+)\/posts$/);
  if (communityPostsMatch && method === 'GET') {
    const comm = communityStore.get(userId, communityPostsMatch[1]);
    const list = comm ? postStore.list(userId, { communityId: comm.id }) : [];
    res.json({ success: true, ...paginate(list, page, limit) });
    return;
  }

  if (path.match(/^\/communities\/[^/]+\/join$/) && method === 'POST') {
    const comm = communityStore.join(userId, path.split('/')[2]);
    res.json({ success: true, message: 'Joined community successfully', data: comm });
    return;
  }
  if (path.match(/^\/communities\/[^/]+\/leave$/) && method === 'DELETE') {
    communityStore.leave(userId, path.split('/')[2]);
    res.json({ success: true, message: 'Left community' });
    return;
  }
  if (path.match(/^\/communities\/[^/]+\/members$/) && method === 'GET') {
    const comm = communityStore.get(userId, path.split('/')[2]);
    res.json({ success: true, data: comm?.moderators || demoPeople.slice(0, 5).map((p) => ({ ...p, role: 'MEMBER' })) });
    return;
  }

  // ── Events ──
  if (path === '/events' && method === 'GET') {
    const list = eventStore.list({ upcoming: req.query.upcoming === 'true', communityId: req.query.communityId as string });
    res.json({ success: true, ...paginate(list, page, limit) });
    return;
  }
  if (path === '/events' && method === 'POST') {
    const event = eventStore.create(userId, req.body);
    res.status(201).json({ success: true, message: 'Event created', data: event });
    return;
  }

  const eventMatch = path.match(/^\/events\/([^/]+)$/);
  if (eventMatch && method === 'GET') {
    const event = eventStore.get(eventMatch[1]);
    if (!event) { res.status(404).json({ success: false, message: 'Event not found' }); return; }
    res.json({ success: true, data: event });
    return;
  }
  if (eventMatch && method === 'PUT') {
    const updated = eventStore.update(eventMatch[1], req.body);
    if (!updated) { res.status(404).json({ success: false, message: 'Event not found' }); return; }
    res.json({ success: true, message: 'Event updated', data: updated });
    return;
  }
  if (eventMatch && method === 'DELETE') {
    eventStore.remove(eventMatch[1]);
    res.json({ success: true, message: 'Event deleted' });
    return;
  }
  if (path.match(/^\/events\/[^/]+\/rsvp$/) && method === 'POST') {
    const result = eventStore.rsvp(userId, path.split('/')[2], req.body?.status || 'GOING');
    res.json({ success: true, message: 'RSVP confirmed! You are registered for this event.', data: result });
    return;
  }
  if (path.match(/^\/events\/[^/]+\/participants$/) && method === 'GET') {
    res.json({ success: true, data: demoPeople.slice(0, 8).map((p) => ({ ...p, status: 'GOING' })) });
    return;
  }

  // ── Jobs ──
  if (path === '/jobs' && method === 'GET') {
    const list = jobStore.list((req.query.q || req.query.search) as string);
    res.json({ success: true, ...paginate(list, page, limit) });
    return;
  }
  if (path === '/jobs' && method === 'POST') {
    const job = jobStore.create(userId, req.body);
    res.status(201).json({ success: true, message: 'Job posted', data: job });
    return;
  }
  const jobMatch = path.match(/^\/jobs\/([^/]+)$/);
  if (jobMatch && method === 'GET') {
    const job = jobStore.get(jobMatch[1]);
    if (!job) { res.status(404).json({ success: false, message: 'Job not found' }); return; }
    res.json({ success: true, data: job });
    return;
  }
  if (path.match(/^\/jobs\/[^/]+\/apply$/) && method === 'POST') {
    jobStore.apply(path.split('/')[2]);
    res.json({ success: true, message: 'Application submitted successfully!' });
    return;
  }

  // ── News (read-only) ──
  if (path === '/news' && method === 'GET') {
    let list = [...allNews];
    const cat = req.query.category as string;
    if (cat) list = list.filter((n) => n.category === cat);
    res.json({ success: true, ...paginate(list, page, limit) });
    return;
  }
  const newsMatch = path.match(/^\/news\/([^/]+)$/);
  if (newsMatch && method === 'GET') {
    const news = getNewsById(newsMatch[1]);
    if (!news) { res.status(404).json({ success: false, message: 'Article not found' }); return; }
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
    let list = [...allTourism];
    const type = req.query.type as string;
    if (type) list = list.filter((t) => t.type === type);
    res.json({ success: true, ...paginate(list, page, limit) });
    return;
  }
  const tourismMatch = path.match(/^\/tourism\/([^/]+)$/);
  if (tourismMatch && method === 'GET') {
    const t = getTourismById(tourismMatch[1]);
    if (!t) { res.status(404).json({ success: false, message: 'Destination not found' }); return; }
    res.json({ success: true, data: t });
    return;
  }

  // ── Gov (read-only) ──
  if (path === '/gov' && method === 'GET') {
    let list = [...allGovServices];
    const cat = req.query.category as string;
    if (cat) list = list.filter((g) => g.category === cat);
    res.json({ success: true, data: list });
    return;
  }
  const govMatch = path.match(/^\/gov\/([^/]+)$/);
  if (govMatch && method === 'GET') {
    const g = getGovById(govMatch[1]);
    if (!g) { res.status(404).json({ success: false, message: 'Service not found' }); return; }
    res.json({ success: true, data: g });
    return;
  }

  // ── Marketplace ──
  if (path === '/marketplace' && method === 'GET') {
    const list = productStore.list(req.query.category as string);
    res.json({ success: true, ...paginate(list, page, limit) });
    return;
  }
  if (path === '/marketplace' && method === 'POST') {
    const product = productStore.create(userId, req.body);
    res.status(201).json({ success: true, message: 'Product listed', data: product });
    return;
  }
  const productMatch = path.match(/^\/marketplace\/([^/]+)$/);
  if (productMatch && method === 'GET') {
    const product = productStore.get(productMatch[1]);
    if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
    res.json({ success: true, data: product });
    return;
  }

  // ── Education (read-only) ──
  if (path === '/education/courses' && method === 'GET') {
    res.json({ success: true, data: allCourses });
    return;
  }
  if (path === '/education/scholarships' && method === 'GET') {
    res.json({ success: true, data: allScholarships });
    return;
  }

  // ── Healthcare (read-only) ──
  if (path === '/healthcare/hospitals' && method === 'GET') {
    res.json({ success: true, data: allHospitals });
    return;
  }
  if (path === '/healthcare/schemes' && method === 'GET') {
    res.json({ success: true, data: allHealthSchemes });
    return;
  }

  // ── Notifications ──
  if (path === '/notifications' && method === 'GET') {
    res.json({ success: true, data: buildDemoNotifications(userId) });
    return;
  }
  if (path.startsWith('/notifications') && method !== 'GET') {
    res.json({ success: true, message: 'Done' });
    return;
  }

  // ── Admin ──
  if (path === '/admin/analytics' && method === 'GET') {
    res.json({ success: true, data: dashboardAnalytics });
    return;
  }
  if (path.startsWith('/admin')) {
    if (method === 'GET') { res.json({ success: true, ...paginate([], 1, 20) }); return; }
    res.json({ success: true, message: 'Action simulated' });
    return;
  }

  // ── Comments (top-level) ──
  if (path.startsWith('/comments')) {
    if (method === 'GET') { res.json({ success: true, data: [] }); return; }
    res.json({ success: true, message: 'Done' });
    return;
  }

  if (path.startsWith('/upload') || path.startsWith('/reports')) {
    res.json({ success: true, message: 'Done' });
    return;
  }

  // Fallback
  if (method === 'GET') { res.json({ success: true, data: [] }); return; }
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    res.json({ success: true, message: 'Action completed in demo mode.' });
    return;
  }
  next();
};
