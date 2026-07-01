"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardAnalytics = exports.getEventById = exports.getCommunityById = exports.getCommunityBySlug = exports.buildCommentsForPost = exports.buildDemoPosts = exports.demoEvents = exports.demoCommunities = void 0;
exports.buildDemoNotifications = buildDemoNotifications;
exports.buildDemoProfile = buildDemoProfile;
// Re-exports for backward compatibility — canonical data lives in demoContent.ts
var demoContent_1 = require("./demoContent");
Object.defineProperty(exports, "demoCommunities", { enumerable: true, get: function () { return demoContent_1.allCommunities; } });
Object.defineProperty(exports, "demoEvents", { enumerable: true, get: function () { return demoContent_1.allEvents; } });
Object.defineProperty(exports, "buildDemoPosts", { enumerable: true, get: function () { return demoContent_1.buildAllPosts; } });
Object.defineProperty(exports, "buildCommentsForPost", { enumerable: true, get: function () { return demoContent_1.buildCommentsForPost; } });
Object.defineProperty(exports, "getCommunityBySlug", { enumerable: true, get: function () { return demoContent_1.getCommunityBySlug; } });
Object.defineProperty(exports, "getCommunityById", { enumerable: true, get: function () { return demoContent_1.getCommunityById; } });
Object.defineProperty(exports, "getEventById", { enumerable: true, get: function () { return demoContent_1.getEventById; } });
Object.defineProperty(exports, "dashboardAnalytics", { enumerable: true, get: function () { return demoContent_1.dashboardAnalytics; } });
const demoData_1 = require("./demoData");
const demoUsers_1 = require("./demoUsers");
function buildDemoNotifications(userId) {
    const types = ['POST_LIKE', 'COMMUNITY_JOIN', 'EVENT_REMINDER', 'ANNOUNCEMENT', 'COMMENT'];
    const bodies = [
        'liked your post about the community garden.',
        'joined Developers Community.',
        'invited you to Tech Meetup — happening this week!',
        'posted a new announcement in Startup Community.',
        'commented on your discussion about local businesses.',
    ];
    return demoUsers_1.demoPeople.slice(0, 8).map((sender, i) => ({
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
function buildDemoProfile(userId) {
    const user = (0, demoData_1.getDemoUserById)(userId) || (0, demoData_1.getDemoUserById)('demo-user-001');
    return {
        ...user,
        passwordHash: undefined,
        _count: { posts: 12, communityMemberships: 5, organizedEvents: 2 },
    };
}
//# sourceMappingURL=demoMockData.js.map