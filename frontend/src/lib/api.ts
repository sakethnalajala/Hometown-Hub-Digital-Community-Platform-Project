import {
  ApiResponse, AuthUser, User, Community, Post, Comment, Event, Notification, Category,
  Job, NewsArticle, MarketplaceItem, TourismSpot, GovScheme, Course, Scholarship,
  Hospital, HealthScheme, DashboardAnalytics, BookmarkToggleResult,
} from '@/types'

// Auth endpoints return the signed-in user plus a token pair.
type AuthPayload = ApiResponse<{ user: AuthUser; accessToken: string; refreshToken: string }>

// Event participant rows as returned by the participants endpoint (flat shape).
interface EventParticipantView {
  id: string
  userId?: string
  status?: string
  profileImage?: string
  name?: string
  hometown?: string
}

// Single-origin architecture.
// The browser ALWAYS talks to the same domain that served the app. Every
// `/api/*` request is transparently reverse-proxied to the backend by Next.js
// rewrites (see next.config.ts), so there is no cross-origin request, no CORS,
// and the backend host is never exposed to the browser. This gives the whole
// application a single public URL.
//
// - In the browser: base URL is the relative path `/api` (same origin).
// - On the server (SSR / build time): there is no "same origin", so we fall
//   back to an absolute backend URL. Never localhost in a deployed build.
const SERVER_FALLBACK =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://hometown-hub-backend-un1i.onrender.com/api'

function resolveBaseUrl(): string {
  // Browser → same-origin relative path, proxied by Next.js rewrites.
  if (typeof window !== 'undefined') return '/api'
  // Server-side rendering needs an absolute URL.
  return SERVER_FALLBACK
}

const BASE_URL = resolveBaseUrl()

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json() as T
    if (!response.ok) {
      const message = typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message?: unknown }).message)
        : 'Request failed'
      const error = new Error(message) as Error & { status?: number; data?: unknown }
      error.status = response.status
      error.data = data
      throw error
    }
    return data
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    // BASE_URL is relative (`/api`) in the browser, so anchor it to the current
    // origin for URL parsing; it is absolute (http...) during SSR.
    const href = BASE_URL.startsWith('http')
      ? `${BASE_URL}${path}`
      : `${window.location.origin}${BASE_URL}${path}`
    const url = new URL(href)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.append(k, String(v))
      })
    }
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    })
    return this.handleResponse<T>(response)
  }

  async post<T>(path: string, body?: Record<string, unknown> | null): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return this.handleResponse<T>(response)
  }

  async postForm<T>(path: string, formData: FormData): Promise<T> {
    const headers: HeadersInit = {}
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    })
    return this.handleResponse<T>(response)
  }

  async put<T>(path: string, body?: Record<string, unknown> | null): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return this.handleResponse<T>(response)
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    return this.handleResponse<T>(response)
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) return null
      const data = await this.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        '/auth/refresh',
        { refreshToken }
      )
      if (data.data) {
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        return data.data
      }
      return null
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      return null
    }
  }
}

export const api = new ApiClient()

// ============================================================
// AUTH API
// ============================================================
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<AuthPayload>('/auth/login', data),
  loginFirebase: (data: { idToken: string; name?: string; username?: string; hometown?: string }) =>
    api.post<AuthPayload>('/auth/firebase', data),
  register: (data: Record<string, unknown>) =>
    api.post<AuthPayload>('/auth/register', data),
  logout: (refreshToken: string) => api.post<ApiResponse<null>>('/auth/logout', { refreshToken }),
  forgotPassword: (email: string) =>
    api.post<ApiResponse<{ resetUrl?: string }>>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post<ApiResponse<null>>('/auth/reset-password', { token, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword }),
  me: () => api.get<ApiResponse<{ user: User } | User>>('/auth/me'),
}

// ============================================================
// USERS API
// ============================================================
export const usersApi = {
  getMe: () => api.get<ApiResponse<User>>('/users/me'),
  updateMe: (data: Record<string, unknown>) => api.put<ApiResponse<User>>('/users/me', data),
  uploadAvatar: (formData: FormData) => api.postForm<ApiResponse<User>>('/users/me/avatar', formData),
  uploadCover: (formData: FormData) => api.postForm<ApiResponse<User>>('/users/me/cover', formData),
  getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
  getPosts: (id: string, params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<Post[]>>(`/users/${id}/posts`, params),
  getCommunities: (id: string) => api.get<ApiResponse<Community[]>>(`/users/${id}/communities`),
  search: (q: string) => api.get<ApiResponse<User[]>>('/users/search/users', { q }),
}

// ============================================================
// COMMUNITIES API
// ============================================================
export const communitiesApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<Community[]>>('/communities', params),
  create: (data: Record<string, unknown>) => api.post<ApiResponse<Community>>('/communities', data),
  getBySlug: (slug: string) => api.get<ApiResponse<Community>>(`/communities/${slug}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Community>>(`/communities/${id}`, data),
  deleteCommunity: (id: string) => api.delete<ApiResponse<null>>(`/communities/${id}`),
  uploadBanner: (id: string, formData: FormData) =>
    api.postForm<ApiResponse<Community>>(`/communities/${id}/banner`, formData),
  join: (id: string) => api.post<ApiResponse<null>>(`/communities/${id}/join`),
  leave: (id: string) => api.delete<ApiResponse<null>>(`/communities/${id}/leave`),
  getMembers: (id: string, params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<User[]>>(`/communities/${id}/members`, params),
  getPosts: (id: string, params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<Post[]>>(`/communities/${id}/posts`, params),
  updateMemberRole: (id: string, userId: string, role: string) =>
    api.put<ApiResponse<null>>(`/communities/${id}/members/${userId}/role`, { role }),
  removeMember: (id: string, userId: string) =>
    api.delete<ApiResponse<null>>(`/communities/${id}/members/${userId}`),
}

// ============================================================
// POSTS API
// ============================================================
export const postsApi = {
  getFeed: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<Post[]>>('/posts', params),
  create: (formData: FormData) => api.postForm<ApiResponse<Post>>('/posts', formData),
  getById: (id: string) => api.get<ApiResponse<Post>>(`/posts/${id}`),
  update: (id: string, content: string) => api.put<ApiResponse<Post>>(`/posts/${id}`, { content }),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/posts/${id}`),
  like: (id: string) => api.post<ApiResponse<{ liked?: boolean; likeCount?: number }>>(`/posts/${id}/like`),
  getComments: (id: string, params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<Comment[]>>(`/posts/${id}/comments`, params),
  addComment: (id: string, data: { content: string; parentId?: string }) =>
    api.post<ApiResponse<Comment>>(`/posts/${id}/comments`, data),
  pin: (id: string) => api.post<ApiResponse<Post>>(`/posts/${id}/pin`),
  share: (id: string) => api.post<ApiResponse<{ shareCount?: number }>>(`/posts/${id}/share`),
}

// ============================================================
// COMMENTS API
// ============================================================
export const commentsApi = {
  update: (id: string, content: string) => api.put<ApiResponse<Comment>>(`/comments/${id}`, { content }),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/comments/${id}`),
  like: (id: string) => api.post<ApiResponse<{ liked?: boolean; likeCount?: number }>>(`/comments/${id}/like`),
  getReplies: (id: string, params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<Comment[]>>(`/comments/${id}/replies`, params),
}

// ============================================================
// EVENTS API
// ============================================================
export const eventsApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<Event[]>>('/events', params),
  create: (data: Record<string, unknown>) => api.post<ApiResponse<Event>>('/events', data),
  getById: (id: string) => api.get<ApiResponse<Event>>(`/events/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.put<ApiResponse<Event>>(`/events/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/events/${id}`),
  rsvp: (id: string, status: string) =>
    api.post<ApiResponse<{ status?: string }>>(`/events/${id}/rsvp`, { status }),
  getParticipants: (id: string, params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<EventParticipantView[]>>(`/events/${id}/participants`, params),
  uploadBanner: (id: string, formData: FormData) =>
    api.postForm<ApiResponse<Event>>(`/events/${id}/banner`, formData),
}

// ============================================================
// NOTIFICATIONS API
// ============================================================
export const notificationsApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<Notification[]>>('/notifications', params),
  markRead: (id: string) => api.put<ApiResponse<Notification>>(`/notifications/${id}/read`),
  markAllRead: () => api.put<ApiResponse<null>>('/notifications/read-all/mark'),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/notifications/${id}`),
  clearAll: () => api.delete<ApiResponse<null>>('/notifications/clear/all'),
}

// ============================================================
// ADMIN API
// ============================================================
export const adminApi = {
  getAnalytics: () => api.get<ApiResponse<DashboardAnalytics>>('/admin/analytics'),
  getUsers: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<User[]>>('/admin/users', params),
  updateUser: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<User>>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete<ApiResponse<null>>(`/admin/users/${id}`),
  getCommunities: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<Community[]>>('/admin/communities', params),
  updateCommunity: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Community>>(`/admin/communities/${id}`, data),
  getReports: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<Record<string, unknown>[]>>('/admin/reports', params),
  updateReport: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Record<string, unknown>>>(`/admin/reports/${id}`, data),
  getCategories: () => api.get<ApiResponse<Category[]>>('/admin/categories'),
  createCategory: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Category>>('/admin/categories', data),
}

// ============================================================
// REPORTS API
// ============================================================
export const reportsApi = {
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Record<string, unknown>>>('/reports', data),
}

// ============================================================
// NEW FEATURES API
// ============================================================
export const jobsApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<Job[]>>('/jobs', params),
  getById: (id: string) => api.get<ApiResponse<Job>>(`/jobs/${id}`),
  create: (data: Record<string, unknown>) => api.post<ApiResponse<Job>>('/jobs', data),
  apply: (id: string) => api.post<ApiResponse<{ applied?: boolean }>>(`/jobs/${id}/apply`),
}

export const newsApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<NewsArticle[]>>('/news', params),
  getById: (id: string) => api.get<ApiResponse<NewsArticle>>(`/news/${id}`),
  like: (id: string) => api.post<ApiResponse<{ likes?: number }>>(`/news/${id}/like`),
  share: (id: string) => api.post<ApiResponse<{ shareCount?: number }>>(`/news/${id}/share`),
}

export const tourismApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<TourismSpot[]>>('/tourism', params),
  getById: (id: string) => api.get<ApiResponse<TourismSpot>>(`/tourism/${id}`),
}

export const govApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<GovScheme[]>>('/gov', params),
  getById: (id: string) => api.get<ApiResponse<GovScheme>>(`/gov/${id}`),
}

export const marketplaceApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<MarketplaceItem[]>>('/marketplace', params),
  getById: (id: string) => api.get<ApiResponse<MarketplaceItem>>(`/marketplace/${id}`),
  create: (data: Record<string, unknown>) => api.post<ApiResponse<MarketplaceItem>>('/marketplace', data),
}

export const dashboardApi = {
  getAnalytics: () => api.get<ApiResponse<DashboardAnalytics>>('/dashboard/analytics'),
}

export const educationApi = {
  getCourses: () => api.get<ApiResponse<Course[]>>('/education/courses'),
  getScholarships: () => api.get<ApiResponse<Scholarship[]>>('/education/scholarships'),
}

export const healthcareApi = {
  getHospitals: () => api.get<ApiResponse<Hospital[]>>('/healthcare/hospitals'),
  getSchemes: () => api.get<ApiResponse<HealthScheme[]>>('/healthcare/schemes'),
}

export const bookmarksApi = {
  getAll: (type?: string) =>
    api.get<ApiResponse<Record<string, unknown>[]>>('/bookmarks', type ? { type } : undefined),
  toggle: (targetType: string, targetId: string) =>
    api.post<ApiResponse<BookmarkToggleResult>>('/bookmarks', { targetType, targetId }),
  remove: (type: string, id: string) => api.delete<ApiResponse<null>>(`/bookmarks/${type}/${id}`),
}
