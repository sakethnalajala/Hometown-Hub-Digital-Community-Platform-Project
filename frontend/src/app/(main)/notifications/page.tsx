'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '@/lib/api'
import { useNotificationStore } from '@/store/notificationStore'
import { Button } from '@/components/ui/button'
import { Loader2, Bell, Check, Trash2, Users, Calendar, Briefcase, ShoppingBag, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { PortalBackground } from '@/components/ui/PortalBackground'

export default function NotificationsPage() {
  const { notifications: storeNotifications, setNotifications, markAllRead: storeMarkAllRead, removeNotification, clearAll } = useNotificationStore()
  const [hydrated, setHydrated] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(),
    retry: false,
  })

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('hometown-hub-notifications-store') : null
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length) {
          const unread = parsed.filter((n: any) => !n.isRead).length
          setNotifications(parsed, unread)
        }
      } catch {
        // Ignore malformed stored notifications
      }
    }
    setHydrated(true)
  }, [setNotifications])

  useEffect(() => {
    if (!hydrated) return
    if (data?.data && !storeNotifications.length) {
      const unread = (data.data as any[]).filter((item) => !item.isRead).length
      setNotifications(data.data, unread)
    }
  }, [data, hydrated, setNotifications, storeNotifications.length])

  const notifications = useMemo(() =>
    [...storeNotifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [storeNotifications]
  )

  return (
    <PortalBackground portal="notifications">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-6">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                <Sparkles className="h-4 w-4" /> Activity Center
              </div>
              <h1 className="text-3xl font-outfit font-bold tracking-tight text-white">Notifications</h1>
              <p className="mt-1 text-sm text-slate-300">Track community, jobs, marketplace, healthcare, and travel activity in one place.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => storeMarkAllRead()} disabled={notifications.length === 0} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                <Check className="mr-2 h-4 w-4" /> Mark all read
              </Button>
              <Button variant="destructive" size="sm" onClick={() => clearAll()} disabled={notifications.length === 0} className="rounded-xl">
                <Trash2 className="mr-2 h-4 w-4" /> Clear all
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-200">
            We could not load notifications right now, but your saved updates remain available locally.
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/20 bg-white/5 py-16 text-center">
            <Bell className="mb-4 h-12 w-12 text-slate-400" />
            <p className="text-lg font-semibold text-white">You are all caught up.</p>
            <p className="mt-2 text-sm text-slate-400">New activity will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification: any) => {
              const bodyLower = notification.body?.toLowerCase() || ''
              let IconClass = Bell
              let iconColor = 'text-cyan-300'
              let bgWrapper = 'bg-cyan-400/10'

              if (bodyLower.includes('community')) {
                IconClass = Users
                iconColor = 'text-purple-400'
                bgWrapper = 'bg-purple-400/10'
              } else if (bodyLower.includes('job') || bodyLower.includes('application')) {
                IconClass = Briefcase
                iconColor = 'text-blue-400'
                bgWrapper = 'bg-blue-400/10'
              } else if (bodyLower.includes('marketplace') || bodyLower.includes('product')) {
                IconClass = ShoppingBag
                iconColor = 'text-emerald-400'
                bgWrapper = 'bg-emerald-400/10'
              } else if (bodyLower.includes('appointment') || bodyLower.includes('health')) {
                IconClass = Calendar
                iconColor = 'text-rose-400'
                bgWrapper = 'bg-rose-400/10'
              }

              return (
                <div key={notification.id} className={`rounded-2xl border p-4 shadow-lg transition-all ${!notification.isRead ? 'border-cyan-400/30 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bgWrapper}`}>
                      <IconClass className={`h-6 w-6 ${iconColor}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-sm font-semibold ${!notification.isRead ? 'text-white' : 'text-slate-200'}`}>
                            {notification.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-300">{notification.body}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeNotification(notification.id)} className="text-slate-300 hover:bg-white/10 hover:text-white">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                        {!notification.isRead && <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-cyan-200">Unread</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PortalBackground>
  )
}
