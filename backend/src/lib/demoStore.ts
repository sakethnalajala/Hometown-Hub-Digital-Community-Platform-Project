/**
 * STATEFUL demo store.
 *
 * Root-cause fix: the demo backend previously returned fake success responses
 * for every create/update/delete and threw the data away, so nothing a user
 * created ever persisted — list refetches and detail pages never saw it. This
 * module holds mutable, in-memory state seeded from the static demo content and
 * actually persists CRUD for the lifetime of the server process, so the whole
 * app behaves like a real backend: create -> appears in list -> opens on its
 * own detail page -> survives refetches.
 */
import {
  allCommunities, allEvents, allJobs, allProducts,
  buildAllPosts, buildCommentsForPost,
} from './demoContent';
import { getDemoUserById } from './demoData';
import { demoPeople } from './demoUsers';

// ── Mutable collections (seeded once from static content) ────────────────────
const communities: any[] = allCommunities.map((c) => ({ ...c }));
const events: any[] = allEvents.map((e) => ({ ...e }));
const jobs: any[] = allJobs.map((j) => ({ ...j }));
const products: any[] = allProducts.map((p) => ({ ...p }));
let posts: any[] = buildAllPosts('demo-user-001');

// Per-entity relational state
const commentsByPost = new Map<string, any[]>();      // postId -> comments[]
const memberships = new Map<string, Set<string>>();    // userId -> communityIds
const rsvps = new Map<string, Map<string, string>>();  // userId -> (eventId -> status)
const postLikes = new Map<string, Set<string>>();      // userId -> postIds

// ── Helpers ──────────────────────────────────────────────────────────────────
let seq = 1000;
function uid(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}${seq.toString(36)}`;
}

function authorOf(userId: string) {
  const u = getDemoUserById(userId) || getDemoUserById('demo-user-001')!;
  return { id: u.id, name: u.name, username: u.username, profileImage: u.profileImage };
}

function slugify(name: string): string {
  return (name || 'untitled')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || `community-${seq}`;
}

const banner = (seed: string, w = 800, h = 300) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

function memberSet(userId: string): Set<string> {
  if (!memberships.has(userId)) memberships.set(userId, new Set());
  return memberships.get(userId)!;
}
function likeSet(userId: string): Set<string> {
  if (!postLikes.has(userId)) postLikes.set(userId, new Set());
  return postLikes.get(userId)!;
}
function rsvpMap(userId: string): Map<string, string> {
  if (!rsvps.has(userId)) rsvps.set(userId, new Map());
  return rsvps.get(userId)!;
}

// ════════════════════════════════════════════════════════════════════════════
// COMMUNITIES
// ════════════════════════════════════════════════════════════════════════════
export const communityStore = {
  list(userId: string, search?: string) {
    let list = communities;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(s) || c.description.toLowerCase().includes(s));
    }
    return list.map((c) => ({ ...c, isJoined: memberSet(userId).has(c.id) }));
  },
  get(userId: string, slugOrId: string) {
    const c = communities.find((x) => x.slug === slugOrId || x.id === slugOrId);
    if (!c) return null;
    return { ...c, isJoined: memberSet(userId).has(c.id) };
  },
  create(userId: string, data: any) {
    const name = String(data.name || 'New Community').trim();
    let slug = slugify(name);
    if (communities.some((c) => c.slug === slug)) slug = `${slug}-${seq}`;
    const cat = data.category || 'Community';
    const community = {
      id: uid('community'),
      slug,
      name,
      description: String(data.description || ''),
      city: data.city || 'Citywide',
      state: data.state || '',
      country: data.country || 'India',
      categoryId: `cat-${String(cat).toLowerCase()}`,
      category: { id: `cat-${String(cat).toLowerCase()}`, name: cat, slug: slugify(cat) },
      bannerImage: banner(slug),
      logoImage: banner(slug, 200, 200),
      isPrivate: Boolean(data.isPrivate),
      rules: Array.isArray(data.rules) ? data.rules : [],
      memberCount: 1,
      postCount: 0,
      status: 'APPROVED',
      moderators: [{ ...authorOf(userId), role: 'ADMIN' as const }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { members: 1, posts: 0 },
    };
    communities.unshift(community);
    memberSet(userId).add(community.id);
    return { ...community, isJoined: true };
  },
  update(id: string, data: any) {
    const c = communities.find((x) => x.id === id || x.slug === id);
    if (!c) return null;
    Object.assign(c, data, { updatedAt: new Date().toISOString() });
    return c;
  },
  remove(id: string) {
    const i = communities.findIndex((x) => x.id === id || x.slug === id);
    if (i === -1) return false;
    communities.splice(i, 1);
    return true;
  },
  join(userId: string, id: string) {
    const c = communities.find((x) => x.id === id || x.slug === id);
    if (!c) return null;
    const set = memberSet(userId);
    if (!set.has(c.id)) { set.add(c.id); c.memberCount += 1; c._count.members += 1; }
    return { ...c, isJoined: true };
  },
  leave(userId: string, id: string) {
    const c = communities.find((x) => x.id === id || x.slug === id);
    if (!c) return null;
    const set = memberSet(userId);
    if (set.has(c.id)) { set.delete(c.id); c.memberCount = Math.max(0, c.memberCount - 1); c._count.members = Math.max(0, c._count.members - 1); }
    return { ...c, isJoined: false };
  },
};

// ════════════════════════════════════════════════════════════════════════════
// EVENTS
// ════════════════════════════════════════════════════════════════════════════
export const eventStore = {
  list(filter: { upcoming?: boolean; communityId?: string } = {}) {
    let list = events;
    if (filter.communityId) list = list.filter((e) => e.communityId === filter.communityId);
    if (filter.upcoming) list = list.filter((e) => new Date(e.date) > new Date());
    return [...list].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  },
  get(id: string) {
    return events.find((e) => e.id === id) || null;
  },
  create(userId: string, data: any) {
    const event = {
      id: uid('event'),
      title: String(data.title || 'New Event'),
      description: String(data.description || ''),
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      location: data.isOnline ? 'Online' : (data.location || 'TBA'),
      address: data.address || '',
      isOnline: Boolean(data.isOnline),
      meetingLink: data.meetingLink || '',
      status: 'UPCOMING',
      category: data.category || 'Community',
      bannerImage: banner(`event-${seq}`),
      communityId: data.communityId || null,
      organizerId: userId,
      maxParticipants: Number(data.maxParticipants) || 100,
      organizer: authorOf(userId),
      community: null,
      participants: [{ user: authorOf(userId), status: 'GOING' }],
      _count: { participants: 1 },
      comments: 0,
      createdAt: new Date().toISOString(),
    };
    events.unshift(event);
    rsvpMap(userId).set(event.id, 'GOING');
    return event;
  },
  update(id: string, data: any) {
    const e = events.find((x) => x.id === id);
    if (!e) return null;
    Object.assign(e, data);
    return e;
  },
  remove(id: string) {
    const i = events.findIndex((x) => x.id === id);
    if (i === -1) return false;
    events.splice(i, 1);
    return true;
  },
  rsvp(userId: string, id: string, status: string) {
    const e = events.find((x) => x.id === id);
    if (!e) return null;
    const map = rsvpMap(userId);
    const had = map.get(id) === 'GOING';
    map.set(id, status);
    const goingNow = status === 'GOING';
    if (goingNow && !had) e._count.participants += 1;
    if (!goingNow && had) e._count.participants = Math.max(0, e._count.participants - 1);
    return { eventId: id, status };
  },
};

// ════════════════════════════════════════════════════════════════════════════
// POSTS + COMMENTS
// ════════════════════════════════════════════════════════════════════════════
export const postStore = {
  list(userId: string, filter: { communityId?: string; type?: string } = {}) {
    let list = posts;
    if (filter.communityId) list = list.filter((p) => p.communityId === filter.communityId);
    if (filter.type) list = list.filter((p) => p.type === filter.type);
    return list.map((p) => ({ ...p, isLiked: likeSet(userId).has(p.id) || p.isLiked }));
  },
  get(userId: string, id: string) {
    const p = posts.find((x) => x.id === id);
    if (!p) return null;
    return { ...p, isLiked: likeSet(userId).has(p.id) || p.isLiked };
  },
  create(userId: string, data: any) {
    const community = data.communityId ? communities.find((c) => c.id === data.communityId) : null;
    const post = {
      id: uid('post'),
      content: String(data.content || ''),
      type: data.type || 'TEXT',
      images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
      authorId: userId,
      communityId: data.communityId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      isLiked: false,
      isPinned: false,
      author: authorOf(userId),
      community: community ? { id: community.id, name: community.name, slug: community.slug } : null,
      _count: { likes: 0, comments: 0 },
    };
    posts.unshift(post);
    if (community) { community.postCount += 1; community._count.posts += 1; }
    return post;
  },
  remove(id: string) {
    const i = posts.findIndex((x) => x.id === id);
    if (i === -1) return false;
    posts.splice(i, 1);
    return true;
  },
  like(userId: string, id: string) {
    const p = posts.find((x) => x.id === id);
    if (!p) return { isLiked: true, likeCount: 1 };
    const set = likeSet(userId);
    if (set.has(id)) { set.delete(id); p.likeCount = Math.max(0, p.likeCount - 1); return { isLiked: false, likeCount: p.likeCount }; }
    set.add(id); p.likeCount += 1; return { isLiked: true, likeCount: p.likeCount };
  },
  getComments(postId: string) {
    if (!commentsByPost.has(postId)) {
      commentsByPost.set(postId, buildCommentsForPost(postId, 3));
    }
    return commentsByPost.get(postId)!;
  },
  addComment(userId: string, postId: string, content: string) {
    const comment = {
      id: uid('comment'),
      postId,
      content: String(content || ''),
      authorId: userId,
      author: authorOf(userId),
      likeCount: 0,
      createdAt: new Date().toISOString(),
    };
    if (!commentsByPost.has(postId)) commentsByPost.set(postId, buildCommentsForPost(postId, 3));
    commentsByPost.get(postId)!.unshift(comment);
    const p = posts.find((x) => x.id === postId);
    if (p) { p.commentCount += 1; p._count.comments += 1; }
    return comment;
  },
};

// ════════════════════════════════════════════════════════════════════════════
// JOBS
// ════════════════════════════════════════════════════════════════════════════
export const jobStore = {
  list(search?: string) {
    if (!search) return jobs;
    const s = search.toLowerCase();
    return jobs.filter((j) => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s) || j.location?.toLowerCase().includes(s));
  },
  get(id: string) {
    return jobs.find((j) => j.id === id) || null;
  },
  create(userId: string, data: any) {
    const job = {
      id: uid('job'),
      title: String(data.title || 'New Position'),
      company: String(data.company || 'Company'),
      companyLogo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.company || 'Company')}`,
      type: data.type || 'Full-time',
      salary: data.salary || 'Negotiable',
      location: data.location || 'Local',
      description: String(data.description || ''),
      skills: Array.isArray(data.skills) ? data.skills : (typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      authorId: userId,
      createdAt: new Date().toISOString(),
      applicants: 0,
    };
    jobs.unshift(job);
    return job;
  },
  apply(id: string) {
    const j = jobs.find((x) => x.id === id);
    if (j) j.applicants += 1;
    return j;
  },
};

// ════════════════════════════════════════════════════════════════════════════
// MARKETPLACE
// ════════════════════════════════════════════════════════════════════════════
export const productStore = {
  list(category?: string) {
    if (!category) return products;
    return products.filter((p) => p.category === category);
  },
  get(id: string) {
    return products.find((p) => p.id === id) || null;
  },
  create(userId: string, data: any) {
    const images = Array.isArray(data.images) ? data.images : (data.image ? [data.image] : [banner(`product-${seq}`, 400, 400)]);
    const product = {
      id: uid('product'),
      name: String(data.name || data.title || 'New Listing'),
      description: String(data.description || ''),
      price: Number(data.price) || 0,
      category: data.category || 'General',
      images,
      image: images[0],
      rating: 0,
      reviewCount: 0,
      sellerId: userId,
      seller: { ...authorOf(userId), rating: 5 },
      reviews: [],
      inStock: true,
      createdAt: new Date().toISOString(),
    };
    products.unshift(product);
    return product;
  },
};
