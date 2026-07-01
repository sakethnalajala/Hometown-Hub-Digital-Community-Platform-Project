import { create } from 'zustand'
import { Notification } from '@/types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  addNotification: (notification: Notification) => void
  setNotifications: (notifications: Notification[], unreadCount: number) => void
  markRead: (id: string) => void
  markAllRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  toggleOpen: () => void
  setOpen: (open: boolean) => void
  incrementUnread: () => void
}

const STORAGE_KEY = 'hometown-hub-notifications-store'

const readStoredNotifications = (): Notification[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const persistNotifications = (notifications: Notification[], unreadCount: number) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  window.localStorage.setItem('hometown-hub-notifications', JSON.stringify(notifications))
  window.localStorage.setItem('hometown-hub-unread-count', String(unreadCount))
}

export const useNotificationStore = create<NotificationState>((set) => {
  const initialNotifications = readStoredNotifications()
  const initialUnreadCount = initialNotifications.filter((n) => !n.isRead).length

  return {
    notifications: initialNotifications,
    unreadCount: initialUnreadCount,
    isOpen: false,

    addNotification: (notification) =>
      set((state) => {
        const notifications = [notification, ...state.notifications]
        const unreadCount = notifications.filter((n) => !n.isRead).length
        persistNotifications(notifications, unreadCount)
        return { notifications, unreadCount }
      }),

    setNotifications: (notifications, unreadCount) => {
      persistNotifications(notifications, unreadCount)
      set({ notifications, unreadCount })
    },

    markRead: (id) =>
      set((state) => {
        const notifications = state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
        const unreadCount = notifications.filter((n) => !n.isRead).length
        persistNotifications(notifications, unreadCount)
        return { notifications, unreadCount }
      }),

    markAllRead: () =>
      set((state) => {
        const notifications = state.notifications.map((n) => ({ ...n, isRead: true }))
        persistNotifications(notifications, 0)
        return { notifications, unreadCount: 0 }
      }),

    removeNotification: (id) =>
      set((state) => {
        const notifications = state.notifications.filter((n) => n.id !== id)
        const unreadCount = notifications.filter((n) => !n.isRead).length
        persistNotifications(notifications, unreadCount)
        return { notifications, unreadCount }
      }),

    clearAll: () => {
      persistNotifications([], 0)
      set({ notifications: [], unreadCount: 0 })
    },

    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    setOpen: (open) => set({ isOpen: open }),
    incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  }
})
