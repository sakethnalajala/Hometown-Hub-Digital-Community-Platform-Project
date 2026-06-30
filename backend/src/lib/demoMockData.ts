// Re-exports for backward compatibility — canonical data lives in demoContent.ts
export {
  allCommunities as demoCommunities,
  allEvents as demoEvents,
  buildAllPosts as buildDemoPosts,
  buildCommentsForPost,
  getCommunityBySlug,
  getCommunityById,
  getEventById,
  dashboardAnalytics,
} from './demoContent';

import { getDemoUserById } from './demoData';
import { demoPeople } from './demoUsers';

export function buildDemoNotifications(userId: string) {
  const types = ['POST_LIKE', 'COMMUNITY_JOIN', 'EVENT_REMINDER', 'ANNOUNCEMENT', 'COMMENT'];
  const bodies = [
    'liked your post about the community garden.',
    'joined Developers Community.',
    'invited you to Tech Meetup — happening this week!',
    'posted a new announcement in Startup Community.',
    'commented on your discussion about local businesses.',
  ];
  return demoPeople.slice(0, 8).map((sender, i) => ({
    id: `notif-${String(i + 1).padStart(3, '0')}`,
    type: types[i % types.length],
    title: types[i % types.length].replace(/_/g, ' '),
    body: bodies[i],
    isRead: i > 2,
    userId,
    senderId: sender.id,
    sender: { id: sender.id, name: sender.name, username: sender.username, profileImage: sender.profileImage },
    createdAt: new Date(Date.now() - i * 3600000 * 5).toISOString(),
  }));
}

export function buildDemoProfile(userId: string) {
  const user = getDemoUserById(userId) || getDemoUserById('demo-user-001')!;
  return {
    ...user,
    passwordHash: undefined,
    _count: { posts: 12, communityMemberships: 5, organizedEvents: 2 },
  };
}
