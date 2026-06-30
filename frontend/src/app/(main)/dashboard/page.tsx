'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { dashboardApi, communitiesApi, eventsApi, postsApi } from '@/lib/api'
import {
  MapPin, Users, Calendar, TrendingUp, Activity, MessageSquare,
  Briefcase, Newspaper, Sparkles, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { PageWrapper, PageSection } from '@/components/ui/PageWrapper'
import { PortalHero } from '@/components/ui/PortalHero'
import { PortalCard, PortalTile } from '@/components/ui/PortalCard'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { SkeletonGrid } from '@/components/ui/SkeletonCard'
import { PORTAL_LIST, getTheme } from '@/lib/theme'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => dashboardApi.getAnalytics(),
  })

  const { data: communitiesData } = useQuery({
    queryKey: ['dashboard-communities'],
    queryFn: () => communitiesApi.getAll({ limit: 5 }),
  })

  const { data: eventsData } = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: () => eventsApi.getAll({ upcoming: 'true', limit: 4 }),
  })

  const { data: postsData } = useQuery({
    queryKey: ['dashboard-posts'],
    queryFn: () => postsApi.getFeed({ limit: 5 }),
  })

  const stats = analytics?.data?.stats
  const trending = analytics?.data
  const communities = communitiesData?.data || trending?.trendingCommunities || []
  const events = eventsData?.data || []
  const discussions = postsData?.data || []

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="skeleton h-44 rounded-3xl" />
        <SkeletonGrid count={4} cols="grid-cols-2 lg:grid-cols-4" />
        <SkeletonGrid count={6} cols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
      </div>
    )
  }

  const statCards = [
    { key: 'healthcare', label: 'Active Users', value: stats?.activeUsers || 3890, icon: Activity },
    { key: 'communities', label: 'Communities', value: stats?.totalCommunities || 15, icon: Users },
    { key: 'jobs', label: 'Open Jobs', value: stats?.totalJobs || 19, icon: Briefcase },
    { key: 'events', label: 'Events', value: stats?.totalEvents || 12, icon: Calendar },
  ]

  return (
    <PageWrapper className="space-y-8">
      {/* Hero */}
      <PageSection>
        <PortalHero
          theme="dashboard"
          eyebrow={
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {user?.hometown || 'Your Hometown'}
            </span>
          }
          title={`Welcome back, ${user?.name?.split(' ')[0] || 'Neighbor'}!`}
          subtitle="Everything happening around you — communities, events, jobs and more — all in one place."
          actions={
            <>
              <Link
                href="/communities"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/15 px-6 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:scale-[1.03] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto sm:min-w-[200px]"
              >
                <Sparkles className="h-4 w-4 shrink-0" /> Explore Communities
              </Link>
              <Link
                href="/events/create"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/15 px-6 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:scale-[1.03] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto sm:min-w-[200px]"
              >
                <Calendar className="h-4 w-4 shrink-0" /> Create Event
              </Link>
            </>
          }
          stats={[
            { label: 'Posts', value: <AnimatedCounter value={12} /> },
            { label: 'Groups', value: <AnimatedCounter value={5} /> },
          ]}
        />
      </PageSection>

      {/* Stat cards */}
      <PageSection>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((s) => {
            const t = getTheme(s.key)
            return (
              <div
                key={s.label}
                className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${t.softBg} p-5 transition-transform hover:scale-[1.02]`}
              >
                <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${t.bg}`}>
                  <s.icon className={`h-5 w-5 ${t.text}`} />
                </div>
                <div className="text-2xl font-bold text-white">
                  <AnimatedCounter value={s.value} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            )
          })}
        </div>
      </PageSection>

      {/* Explore Portals */}
      <PageSection>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-outfit text-xl font-bold text-white">
            <Sparkles className="h-5 w-5 text-violet-400" /> Explore Portals
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PORTAL_LIST.map((t) => (
            <PortalTile key={t.key} theme={t} />
          ))}
        </div>
      </PageSection>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Trending Discussions */}
          <PageSection>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-outfit text-xl font-bold text-white">
                <TrendingUp className="h-5 w-5 text-violet-400" /> Trending Discussions
              </h2>
              <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-violet-400 hover:text-violet-300">
                View Feed <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {discussions.slice(0, 5).map((post: any) => (
                <PortalCard key={post.id} theme="communities" href="/">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-purple-400">
                          {post.community?.name || 'Community'}
                        </span>
                        <p className="line-clamp-2 text-white transition-colors group-hover:text-purple-200">
                          {post.content}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">by {post.author?.name}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        {post.commentCount || 0}
                      </div>
                    </div>
                  </div>
                </PortalCard>
              ))}
            </div>
          </PageSection>

          {/* Trending News */}
          {trending?.trendingNews && (
            <PageSection>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-outfit text-xl font-bold text-white">
                  <Newspaper className="h-5 w-5 text-red-400" /> Trending News
                </h2>
                <Link href="/news" className="inline-flex items-center gap-1 text-sm font-medium text-red-400 hover:text-red-300">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {trending.trendingNews.map((n: any) => (
                  <PortalCard key={n.id} theme="news" href={`/news/${n.id}`}>
                    <div className="p-4">
                      <span className="text-xs font-medium text-red-400">{n.category}</span>
                      <p className="mt-1 line-clamp-1 text-sm text-white">{n.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{n.views?.toLocaleString()} views</p>
                    </div>
                  </PortalCard>
                ))}
              </div>
            </PageSection>
          )}
        </div>

        <div className="space-y-8">
          {/* Popular Communities */}
          <PageSection>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-outfit text-xl font-bold text-white">
                <Users className="h-5 w-5 text-purple-400" /> Popular Groups
              </h2>
              <Link href="/communities" className="text-sm font-medium text-purple-400 hover:text-purple-300">All</Link>
            </div>
            <div className="grid gap-3">
              {communities.slice(0, 5).map((c: any) => (
                <PortalCard key={c.id || c.slug} theme="communities" href={`/communities/${c.slug}`}>
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30">
                      <Users className="h-5 w-5 text-purple-300" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-purple-300">{c.name}</h4>
                      <p className="text-xs text-muted-foreground">{(c.memberCount || c._count?.members || 0).toLocaleString()} members</p>
                    </div>
                  </div>
                </PortalCard>
              ))}
            </div>
          </PageSection>

          {/* Upcoming Events */}
          <PageSection>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-outfit text-xl font-bold text-white">
                <Calendar className="h-5 w-5 text-orange-400" /> Upcoming Events
              </h2>
              <Link href="/events" className="text-sm font-medium text-orange-400 hover:text-orange-300">All</Link>
            </div>
            <div className="grid gap-3">
              {events.slice(0, 4).map((event: any) => (
                <PortalCard key={event.id} theme="events" href={`/events/${event.id}`}>
                  <div className="flex items-center gap-4 p-4">
                    <div className="min-w-[56px] rounded-xl border border-white/5 bg-gradient-to-br from-orange-500/20 to-amber-500/20 p-3 text-center">
                      <div className="text-xs font-bold uppercase text-orange-400">{format(new Date(event.date), 'MMM')}</div>
                      <div className="text-lg font-bold text-white">{format(new Date(event.date), 'd')}</div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-white">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">{event._count?.participants || 0} attending</p>
                    </div>
                  </div>
                </PortalCard>
              ))}
            </div>
          </PageSection>

          {/* Hot Jobs */}
          {trending?.trendingJobs && (
            <PageSection>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-outfit text-xl font-bold text-white">
                  <Briefcase className="h-5 w-5 text-blue-400" /> Hot Jobs
                </h2>
                <Link href="/jobs" className="text-sm font-medium text-blue-400 hover:text-blue-300">All</Link>
              </div>
              <div className="space-y-2">
                {trending.trendingJobs.map((j: any) => (
                  <PortalCard key={j.id} theme="jobs" href={`/jobs/${j.id}`}>
                    <div className="p-3">
                      <p className="truncate text-sm font-medium text-white">{j.title}</p>
                      <p className="text-xs text-muted-foreground">{j.company} • {j.applicants} applicants</p>
                    </div>
                  </PortalCard>
                ))}
              </div>
            </PageSection>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
