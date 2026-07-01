import { ApiResponse, PaginatedResponse } from '@/types'

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
    const data = await response.json()
    if (!response.ok) {
      const error = new Error(data.message || 'Request failed') as any
      error.status = response.status
      error.data = data
      throw error
    }
    return data
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
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

  async post<T>(path: string, body?: any): Promise<T> {
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

  async put<T>(path: string, body?: any): Promise<T> {
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
    api.post<ApiResponse<{ user: any; accessToken: string; refreshToken: string }>>('/auth/login', data),
  loginFirebase: (data: { idToken: string; name?: string; username?: string; hometown?: string }) =>
    api.post<ApiResponse<{ user: any; accessToken: string; refreshToken: string }>>('/auth/firebase', data),
  register: (data: { idToken?: string; [key: string]: any }) =>
    api.post<ApiResponse<{ user: any; accessToken: string; refreshToken: string }>>('/auth/register', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  me: () => api.get<ApiResponse<any>>('/auth/me'),
}

// ============================================================
// USERS API
// ============================================================
export const usersApi = {
  getMe: () => api.get<ApiResponse<any>>('/users/me'),
  updateMe: (data: any) => api.put<ApiResponse<any>>('/users/me', data),
  uploadAvatar: (formData: FormData) => api.postForm<ApiResponse<any>>('/users/me/avatar', formData),
  uploadCover: (formData: FormData) => api.postForm<ApiResponse<any>>('/users/me/cover', formData),
  getById: (id: string) => api.get<ApiResponse<any>>(`/users/${id}`),
  getPosts: (id: string, params?: any) => api.get<PaginatedResponse<any>>(`/users/${id}/posts`, params),
  getCommunities: (id: string) => api.get<ApiResponse<any[]>>(`/users/${id}/communities`),
  search: (q: string) => api.get<ApiResponse<any[]>>('/users/search/users', { q }),
}

// ============================================================
// COMMUNITIES API
// ============================================================
export const communitiesApi = {
  getAll: (params?: any) => api.get<PaginatedResponse<any>>('/communities', params),
  create: (data: any) => api.post<ApiResponse<any>>('/communities', data),
  getBySlug: (slug: string) => api.get<ApiResponse<any>>(`/communities/${slug}`),
  update: (id: string, data: any) => api.put<ApiResponse<any>>(`/communities/${id}`, data),
  uploadBanner: (id: string, formData: FormData) =>
    api.postForm<ApiResponse<any>>(`/communities/${id}/banner`, formData),
  join: (id: string) => api.post<ApiResponse<any>>(`/communities/${id}/join`),
  leave: (id: string) => api.delete<ApiResponse<any>>(`/communities/${id}/leave`),
  getMembers: (id: string, params?: any) =>
    api.get<ApiResponse<any[]>>(`/communities/${id}/members`, params),
  getPosts: (id: string, params?: any) =>
    api.get<PaginatedResponse<any>>(`/communities/${id}/posts`, params),
  updateMemberRole: (id: string, userId: string, role: string) =>
    api.put(`/communities/${id}/members/${userId}/role`, { role }),
  removeMember: (id: string, userId: string) =>
    api.delete(`/communities/${id}/members/${userId}`),
}

// ============================================================
// POSTS API
// ============================================================
export const postsApi = {
  getFeed: (params?: any) => api.get<PaginatedResponse<any>>('/posts', params),
  create: (formData: FormData) => api.postForm<ApiResponse<any>>('/posts', formData),
  getById: (id: string) => api.get<ApiResponse<any>>(`/posts/${id}`),
  update: (id: string, content: string) => api.put<ApiResponse<any>>(`/posts/${id}`, { content }),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/posts/${id}`),
  like: (id: string) => api.post<ApiResponse<any>>(`/posts/${id}/like`),
  getComments: (id: string, params?: any) =>
    api.get<ApiResponse<any[]>>(`/posts/${id}/comments`, params),
  addComment: (id: string, data: { content: string; parentId?: string }) =>
    api.post<ApiResponse<any>>(`/posts/${id}/comments`, data),
  pin: (id: string) => api.post<ApiResponse<any>>(`/posts/${id}/pin`),
  share: (id: string) => api.post<ApiResponse<any>>(`/posts/${id}/share`),
}

// ============================================================
// COMMENTS API
// ============================================================
export const commentsApi = {
  update: (id: string, content: string) => api.put<ApiResponse<any>>(`/comments/${id}`, { content }),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/comments/${id}`),
  like: (id: string) => api.post<ApiResponse<any>>(`/comments/${id}/like`),
  getReplies: (id: string, params?: any) =>
    api.get<ApiResponse<any[]>>(`/comments/${id}/replies`, params),
}

// ============================================================
// EVENTS API
// ============================================================
export const eventsApi = {
  getAll: (params?: any) => api.get<PaginatedResponse<any>>('/events', params),
  create: (data: any) => api.post<ApiResponse<any>>('/events', data),
  getById: (id: string) => api.get<ApiResponse<any>>(`/events/${id}`),
  update: (id: string, data: any) => api.put<ApiResponse<any>>(`/events/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/events/${id}`),
  rsvp: (id: string, status: string) => api.post<ApiResponse<any>>(`/events/${id}/rsvp`, { status }),
  getParticipants: (id: string, params?: any) =>
    api.get<ApiResponse<any[]>>(`/events/${id}/participants`, params),
  uploadBanner: (id: string, formData: FormData) =>
    api.postForm<ApiResponse<any>>(`/events/${id}/banner`, formData),
}

// ============================================================
// NOTIFICATIONS API
// ============================================================
export const notificationsApi = {
  getAll: (params?: any) => api.get<any>('/notifications', params),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all/mark'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications/clear/all'),
}

// ============================================================
// ADMIN API
// ============================================================
export const adminApi = {
  getAnalytics: () => api.get<ApiResponse<any>>('/admin/analytics'),
  getUsers: (params?: any) => api.get<PaginatedResponse<any>>('/admin/users', params),
  updateUser: (id: string, data: any) => api.put<ApiResponse<any>>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getCommunities: (params?: any) => api.get<PaginatedResponse<any>>('/admin/communities', params),
  updateCommunity: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/admin/communities/${id}`, data),
  getReports: (params?: any) => api.get<PaginatedResponse<any>>('/admin/reports', params),
  updateReport: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/admin/reports/${id}`, data),
  getCategories: () => api.get<ApiResponse<any[]>>('/admin/categories'),
  createCategory: (data: any) => api.post<ApiResponse<any>>('/admin/categories', data),
}

// ============================================================
// REPORTS API
// ============================================================
export const reportsApi = {
  create: (data: any) => api.post<ApiResponse<any>>('/reports', data),
}

// ============================================================
// NEW FEATURES API
// ============================================================
export const jobsApi = {
  getAll: (params?: any) => api.get<PaginatedResponse<any>>('/jobs', params),
  getById: (id: string) => api.get<ApiResponse<any>>(`/jobs/${id}`),
  create: (data: any) => api.post<ApiResponse<any>>('/jobs', data),
  apply: (id: string) => api.post<ApiResponse<any>>(`/jobs/${id}/apply`),
}

export const newsApi = {
  getAll: (params?: any) => api.get<PaginatedResponse<any>>('/news', params),
  getById: (id: string) => api.get<ApiResponse<any>>(`/news/${id}`),
  like: (id: string) => api.post<ApiResponse<any>>(`/news/${id}/like`),
  share: (id: string) => api.post<ApiResponse<any>>(`/news/${id}/share`),
}

export const tourismApi = {
  getAll: (params?: any) => api.get<PaginatedResponse<any>>('/tourism', params),
  getById: (id: string) => api.get<ApiResponse<any>>(`/tourism/${id}`),
}

export const govApi = {
  getAll: (params?: any) => api.get<ApiResponse<any>>('/gov', params),
  getById: (id: string) => api.get<ApiResponse<any>>(`/gov/${id}`),
}

export const marketplaceApi = {
  getAll: (params?: any) => api.get<PaginatedResponse<any>>('/marketplace', params),
  getById: (id: string) => api.get<ApiResponse<any>>(`/marketplace/${id}`),
  create: (data: any) => api.post<ApiResponse<any>>('/marketplace', data),
}

export const dashboardApi = {
  getAnalytics: () => api.get<ApiResponse<any>>('/dashboard/analytics'),
}

export const educationApi = {
  getCourses: () => api.get<ApiResponse<any[]>>('/education/courses'),
  getScholarships: () => api.get<ApiResponse<any[]>>('/education/scholarships'),
}

export const healthcareApi = {
  getHospitals: () => api.get<ApiResponse<any[]>>('/healthcare/hospitals'),
  getSchemes: () => api.get<ApiResponse<any[]>>('/healthcare/schemes'),
}

export const bookmarksApi = {
  getAll: (type?: string) => api.get<ApiResponse<any[]>>('/bookmarks', type ? { type } : undefined),
  toggle: (targetType: string, targetId: string) =>
    api.post<ApiResponse<{ saved: boolean }>>('/bookmarks', { targetType, targetId }),
  remove: (type: string, id: string) => api.delete(`/bookmarks/${type}/${id}`),
}
