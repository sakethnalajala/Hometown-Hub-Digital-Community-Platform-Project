// ============================================================
// CORE TYPES
// ============================================================

export type Role = 'USER' | 'MODERATOR' | 'ADMIN';
export type MemberRole = 'MEMBER' | 'MODERATOR' | 'ADMIN';
export type PostType = 'TEXT' | 'IMAGE' | 'ANNOUNCEMENT' | 'EVENT';
export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type RSVPStatus = 'GOING' | 'MAYBE' | 'NOT_GOING';
export type NotificationType =
  | 'LIKE' | 'COMMENT' | 'FOLLOW' | 'JOIN_REQUEST' | 'JOIN_APPROVED'
  | 'JOIN_REJECTED' | 'NEW_POST' | 'NEW_EVENT' | 'EVENT_REMINDER'
  | 'ANNOUNCEMENT' | 'MENTION' | 'REPORT_RESOLVED' | 'SYSTEM';

// ============================================================
// USER
// ============================================================

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  hometown?: string;
  currentCity?: string;
  interests: string[];
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  lastSeen?: string;
  createdAt: string;
  _count?: {
    communityMemberships: number;
    posts: number;
    organizedEvents: number;
  };
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  profileImage?: string;
  hometown?: string;
  currentCity?: string;
  bio?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ============================================================
// COMMUNITY
// ============================================================

export type CommunityStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type MemberStatus = 'PENDING' | 'APPROVED' | 'BANNED';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  state?: string;
  country: string;
  bannerImage?: string;
  logoImage?: string;
  rules: string[];
  status: CommunityStatus;
  isPrivate: boolean;
  memberCount: number;
  postCount: number;
  categoryId?: string;
  category?: Category;
  createdBy?: Pick<User, 'id' | 'name' | 'username' | 'profileImage'>;
  moderators?: Array<Pick<User, 'id' | 'name' | 'username' | 'profileImage'>>;
  createdAt: string;
  _count?: { members: number; posts: number; events: number };
}

export interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  user?: Pick<User, 'id' | 'name' | 'username' | 'profileImage' | 'hometown'>;
  community?: Community;
}

// ============================================================
// POST
// ============================================================

export interface Post {
  id: string;
  content: string;
  images: string[];
  type: PostType;
  isPinned: boolean;
  isEdited: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  authorId: string;
  communityId?: string;
  author: Pick<User, 'id' | 'name' | 'username' | 'profileImage'>;
  community?: Pick<Community, 'id' | 'name' | 'slug' | 'logoImage'>;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { likes: number; comments: number };
}

export interface Comment {
  id: string;
  content: string;
  isEdited: boolean;
  likeCount: number;
  authorId: string;
  postId: string;
  parentId?: string;
  author: Pick<User, 'id' | 'name' | 'username' | 'profileImage'>;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
  _count?: { replies: number };
}

// ============================================================
// EVENT
// ============================================================

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  category?: string;
  time?: string;
  date: string;
  endDate?: string;
  bannerImage?: string;
  isOnline: boolean;
  meetingLink?: string;
  maxParticipants?: number;
  status: EventStatus;
  organizerId: string;
  communityId?: string;
  organizer: Pick<User, 'id' | 'name' | 'username' | 'profileImage'>;
  community?: Pick<Community, 'id' | 'name' | 'slug' | 'logoImage'>;
  participants?: EventParticipant[];
  _count?: { participants: number };
  createdAt: string;
}

export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  status: RSVPStatus;
  user: Pick<User, 'id' | 'name' | 'profileImage' | 'hometown'>;
  createdAt: string;
}

// ============================================================
// NOTIFICATION
// ============================================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  actionUrl?: string;
  imageUrl?: string;
  receiverId: string;
  senderId?: string;
  relatedId?: string;
  relatedType?: string;
  sender?: Pick<User, 'id' | 'name' | 'profileImage'>;
  createdAt: string;
}

// ============================================================
// API RESPONSE
// ============================================================

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================
// NEW FEATURE RESOURCES (demo-mode view models — every field optional
// so that hardcoded SAMPLE_* arrays and API payloads are both assignable)
// ============================================================

export interface Job {
  id?: string;
  title?: string;
  company?: string;
  companyLogo?: string;
  location?: string;
  type?: string;
  salary?: string;
  description?: string;
  category?: string;
  website?: string;
  createdAt?: string;
  applicants?: number;
  requirements?: string[] | string;
  experience?: string;
  skills?: string[] | string;
  contactEmail?: string;
  author?: { id?: string; name?: string; profileImage?: string };
}

export interface NewsArticle {
  id?: string;
  title?: string;
  category?: string;
  description?: string;
  summary?: string;
  content?: string;
  image?: string;
  imageUrl?: string;
  author?: { name?: string } | string;
  source?: string;
  url?: string;
  views?: number;
  likeCount?: number;
  likes?: number;
  commentCount?: number;
  isFeatured?: boolean;
  trending?: boolean;
  createdAt?: string;
  publishedAt?: string;
  readTime?: string;
  tags?: string[];
}

export interface MarketplaceSeller {
  name?: string;
  profileImage?: string;
}

export interface MarketplaceReview {
  id?: string;
  user?: { name?: string } | string;
  author?: { name?: string; profileImage?: string };
  name?: string;
  rating?: number;
  comment?: string;
  content?: string;
  createdAt?: string;
}

export interface MarketplaceItem {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  price?: number | string;
  seller?: MarketplaceSeller;
  location?: string;
  rating?: number;
  category?: string;
  stock?: number;
  image?: string;
  images?: string[] | string;
  website?: string;
  condition?: string;
  reviews?: MarketplaceReview[];
  createdAt?: string;
}

export interface TourismSpot {
  id?: string;
  name?: string;
  type?: string;
  description?: string;
  image?: string;
  rating?: number;
  location?: string;
  distance?: string;
  bestTime?: string;
  entryFee?: string;
  createdAt?: string;
}

export interface GovScheme {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  category?: string;
  eligibility?: string;
  benefits?: string;
  website?: string;
  createdAt?: string;
}

export interface Course {
  id?: string;
  name?: string;
  title?: string;
  provider?: string;
  institution?: string;
  description?: string;
  duration?: string;
  level?: string;
  category?: string;
  image?: string;
  rating?: number;
  price?: number | string;
  website?: string;
  createdAt?: string;
}

export interface Scholarship {
  id?: string;
  name?: string;
  title?: string;
  provider?: string;
  description?: string;
  amount?: string;
  eligibility?: string;
  deadline?: string;
  category?: string;
  website?: string;
  createdAt?: string;
}

export interface Hospital {
  id?: string;
  name?: string;
  type?: string;
  image?: string;
  rating?: number;
  specialities?: string[];
  distance?: string;
  address?: string;
  beds?: number;
  phone?: string;
  emergency?: boolean;
  createdAt?: string;
}

export interface HealthScheme {
  id?: string;
  name?: string;
  description?: string;
  color?: string;
  border?: string;
}

export interface DashboardAnalytics {
  stats?: {
    activeUsers?: number;
    totalCommunities?: number;
    totalJobs?: number;
    totalEvents?: number;
  };
  trendingCommunities?: Community[];
  trendingNews?: NewsArticle[];
  trendingJobs?: Job[];
}

export interface BookmarkToggleResult {
  saved?: boolean;
}

// ============================================================
// FORMS
// ============================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  hometown?: string;
  currentCity?: string;
}

export interface CreatePostFormData {
  content: string;
  type: PostType;
  communityId?: string;
  images?: File[];
}

export interface CreateCommunityFormData {
  name: string;
  description: string;
  city: string;
  state?: string;
  country: string;
  categoryId?: string;
  isPrivate: boolean;
  rules: string[];
}

export interface CreateEventFormData {
  title: string;
  description: string;
  location: string;
  address?: string;
  date: string;
  endDate?: string;
  isOnline: boolean;
  meetingLink?: string;
  maxParticipants?: number;
  communityId?: string;
}
