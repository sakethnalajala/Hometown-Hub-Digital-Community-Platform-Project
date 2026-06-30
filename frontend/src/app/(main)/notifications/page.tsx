'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/lib/api'
import { useNotificationStore } from '@/store/notificationStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Bell, Check, Trash2, Users, Calendar, Briefcase, ShoppingBag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { setNotifications, markAllRead: storeMarkAllRead } = useNotificationStore()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(),
  })

  useEffect(() => {
    if (data?.data) {
      const unread = data.data.filter((n: any) => !n.isRead).length
      setNotifications(data.data, unread)
    }
  }, [data, setNotifications])

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      storeMarkAllRead()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const clearAllMutation = useMutation({
    mutationFn: () => notificationsApi.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const notifications = data?.data || []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-outfit font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your community</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()} disabled={markAllReadMutation.isPending || notifications.length === 0}>
            <Check className="mr-2 h-4 w-4" /> Mark all read
          </Button>
          <Button variant="ghost" size="sm" onClick={() => clearAllMutation.mutate()} disabled={clearAllMutation.isPending || notifications.length === 0} className="text-brand-error hover:text-brand-error hover:bg-brand-error/10">
            <Trash2 className="mr-2 h-4 w-4" /> Clear
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed flex flex-col items-center">
          <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: any) => {
            const bodyLower = notification.body?.toLowerCase() || '';
            let IconClass = Bell;
            let iconColor = 'text-primary';
            let bgWrapper = 'bg-primary/10';

            if (bodyLower.includes('community') || bodyLower.includes('post')) {
              IconClass = Users;
              iconColor = 'text-purple-400';
              bgWrapper = 'bg-purple-400/10';
            } else if (bodyLower.includes('event')) {
              IconClass = Calendar;
              iconColor = 'text-pink-400';
              bgWrapper = 'bg-pink-400/10';
            } else if (bodyLower.includes('job') || bodyLower.includes('application')) {
              IconClass = Briefcase;
              iconColor = 'text-blue-400';
              bgWrapper = 'bg-blue-400/10';
            } else if (bodyLower.includes('marketplace') || bodyLower.includes('product')) {
              IconClass = ShoppingBag;
              iconColor = 'text-emerald-400';
              bgWrapper = 'bg-emerald-400/10';
            }

            return (
              <div key={notification.id} className={`p-4 rounded-2xl transition-all border ${!notification.isRead ? 'bg-white/10 border-white/20 shadow-lg' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                <div className="flex gap-4 items-start">
                  {notification.sender?.profileImage ? (
                    <Avatar className="h-12 w-12 shrink-0 border-2 border-background">
                      <AvatarImage src={notification.sender.profileImage} />
                      <AvatarFallback><IconClass className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${bgWrapper}`}>
                      <IconClass className={`h-6 w-6 ${iconColor}`} />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-1 mt-1">
                    <p className={`text-sm ${!notification.isRead ? 'font-medium text-white' : 'text-gray-300'}`}>
                      {notification.sender?.name && <span className="font-semibold text-white mr-1">{notification.sender.name}</span>}
                      {notification.body}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  
                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
