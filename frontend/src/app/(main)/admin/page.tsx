'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Users, Building, FileText, AlertTriangle } from 'lucide-react'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore()

  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/')
    }
  }, [isAuthenticated, user, isAuthLoading, router])

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => adminApi.getAnalytics(),
    enabled: isAuthenticated && user?.role === 'ADMIN',
  })

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user?.role !== 'ADMIN') return null

  const stats = (analyticsData?.data?.stats ?? {}) as Record<string, number>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-outfit font-bold tracking-tight">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.newUsersToday || 0} today
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Communities</CardTitle>
            <Building className="h-4 w-4 text-brand-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommunities || 0}</div>
            <p className="text-xs text-brand-warning mt-1">
              {stats.pendingCommunities || 0} pending approval
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-brand-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts || 0}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-brand-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-center py-8 text-muted-foreground text-sm">
                Activity graph will appear here
             </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <span className="badge badge-success">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Socket Server</span>
                  <span className="badge badge-success">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage (Cloudinary)</span>
                  <span className="badge badge-success">Active</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
