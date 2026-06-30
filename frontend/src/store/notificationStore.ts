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

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  setNotifications: (notifications, unreadCount) =>
    set({ notifications, unreadCount }),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: state.notifications.find(n => n.id === id && !n.isRead)
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
}))
