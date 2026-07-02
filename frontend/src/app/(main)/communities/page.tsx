'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Search, Filter, Users, MapPin, Plus, Loader2, Sparkles, LogOut, MapIcon, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { communitiesApi } from '@/lib/api'
import { PortalBackground } from '@/components/ui/PortalBackground'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { toast } from 'sonner'
import { triggerAppNotification, openExternalLink } from '@/lib/appHelpers'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Community } from '@/types'

import type { Category } from '@/types'

interface CommunityCard extends Omit<Partial<Community>, 'category'> {
  category?: Category | string
  members?: number
  image?: string
  owner?: boolean
  joined?: boolean
  membershipStatus?: string
}

const SAMPLE_COMMUNITIES = [
  { id: 'sample-community-1', name: 'Hyderabad Makers Circle', description: 'A creative hub for builders, designers, and founders sharing local expertise.', city: 'Hyderabad', category: 'Technology', members: 184, image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=400&fit=crop&auto=format&q=70', owner: true, joined: true },
  { id: 'sample-community-2', name: 'Bengaluru Foodies', description: 'Explore hidden cafés, food festivals, and authentic home-style recipes.', city: 'Bengaluru', category: 'Food', members: 268, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop&auto=format&q=70', owner: false, joined: false },
  { id: 'sample-community-3', name: 'Chennai Wellness Collective', description: 'Wellness talks, yoga meetups, and healthy-living resources for every neighborhood.', city: 'Chennai', category: 'Wellness', members: 132, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop&auto=format&q=70', owner: false, joined: true },
  { id: 'sample-community-4', name: 'Pune Startup Circle', description: 'Support local startups, mentors, and community-led pitch sessions.', city: 'Pune', category: 'Startup', members: 221, image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop&auto=format&q=70', owner: false, joined: false },
  { id: 'sample-community-5', name: 'Kolkata Heritage Club', description: 'Celebrate culture, history, heritage walks, and neighborhood stories.', city: 'Kolkata', category: 'Culture', members: 157, image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=400&fit=crop&auto=format&q=70', owner: false, joined: false },
  { id: 'sample-community-6', name: 'Delhi Parents Network', description: 'Resources for families, school updates, and local parenting groups.', city: 'Delhi', category: 'Family', members: 309, image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&h=400&fit=crop&auto=format&q=70', owner: true, joined: false },
  { id: 'sample-community-7', name: 'Mumbai Fitness Crew', description: 'Daily workouts, weekend runs, and healthy habits for busy city living.', city: 'Mumbai', category: 'Fitness', members: 194, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop&auto=format&q=70', owner: false, joined: true },
  { id: 'sample-community-8', name: 'London Book Circle', description: 'Monthly meetups discussing contemporary literature and author sessions.', city: 'London', category: 'Books', members: 412, image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=400&fit=crop&auto=format&q=70', owner: false, joined: false },
  { id: 'sample-community-9', name: 'San Francisco Devs', description: 'Tech talks, open-source sprints and networking for engineers in the Bay Area.', city: 'San Francisco', category: 'Technology', members: 1250, image: 'https://images.unsplash.com/photo-1485217988980-11786ced9454?w=800&h=400&fit=crop&auto=format&q=70', owner: false, joined: false },
  { id: 'sample-community-10', name: 'Berlin Art Collective', description: 'Artists sharing studio spaces, exhibitions, and collaboration opportunities.', city: 'Berlin', category: 'Art', members: 98, image: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800&h=400&fit=crop&auto=format&q=70', owner: false, joined: false },
  { id: 'sample-community-11', name: 'Tokyo Startups', description: 'Founders meetups, investor office hours and product demos.', city: 'Tokyo', category: 'Startup', members: 340, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop&auto=format&q=70', owner: false, joined: false },
  { id: 'sample-community-12', name: 'Sydney Surf & Yoga', description: 'Beach cleanups, surf lessons and weekend yoga sessions.', city: 'Sydney', category: 'Wellness', members: 220, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop&auto=format&q=70', owner: false, joined: false },
  { id: 'sample-community-13', name: 'Toronto Coding Dojo', description: 'Hands-on workshops, code reviews and mentorship programs.', city: 'Toronto', category: 'Education', members: 305, image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop&auto=format&q=70', owner: false, joined: false },
  { id: 'sample-community-14', name: 'Paris Food Lovers', description: 'Gastronomy tours, pop-up dinners and recipe exchanges.', city: 'Paris', category: 'Food', members: 156, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop&auto=format&q=70', owner: false, joined: false },
  { id: 'sample-community-15', name: 'Lagos Makers', description: 'Community-driven projects, maker space events and hardware workshops.', city: 'Lagos', category: 'Technology', members: 84, image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=800&h=400&fit=crop&auto=format&q=70', owner: false, joined: false },
]

const JOINED_STORAGE_KEY = 'hometown-hub-joined-communities'

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [communityToExit, setCommunityToExit] = useState<CommunityCard | null>(null)
  const [joinedIds, setJoinedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = window.localStorage.getItem(JOINED_STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {
      // fall through to defaults
    }
    return SAMPLE_COMMUNITIES.filter((c) => c.joined).map((c) => c.id)
  })

  const persistJoinedIds = (ids: string[]) => {
    setJoinedIds(ids)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(JOINED_STORAGE_KEY, JSON.stringify(ids))
    }
  }

  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['communities', searchQuery],
    queryFn: () => communitiesApi.getAll(searchQuery ? { search: searchQuery } : undefined),
  })

  const communities = useMemo(() => data?.data || [], [data?.data])

  const visibleCommunities = useMemo<CommunityCard[]>(() => {
    const apiCommunities: CommunityCard[] = communities.length > 0 ? communities : []
    const filteredSamples = SAMPLE_COMMUNITIES.filter((community) => {
      if (!searchQuery) return true
      return `${community.name} ${community.description} ${community.city} ${community.category}`.toLowerCase().includes(searchQuery.toLowerCase())
    })
    // Merge API communities first, then samples; allow up to 15 visible cards
    return [...apiCommunities, ...filteredSamples].slice(0, 15)
  }, [communities, searchQuery])

  const joinMutation = useMutation({
    mutationFn: (communityId: string) => communitiesApi.join(communityId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communities'], exact: false }),
  })

  const leaveMutation = useMutation({
    mutationFn: (communityId: string) => communitiesApi.leave(communityId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communities'], exact: false }),
  })

  const handleJoin = async (e: React.MouseEvent, community: CommunityCard) => {
    e.preventDefault()
    e.stopPropagation()
    if (!community.id) return
    persistJoinedIds(Array.from(new Set([...joinedIds, community.id])))
    try {
      if (!community.id.startsWith('sample-')) await joinMutation.mutateAsync(community.id)
      triggerAppNotification('Community joined', `You joined ${community.name}.`)
      toast.success(`You joined ${community.name}!`)
      openExternalLink(`https://www.google.com/maps/search/${encodeURIComponent(community.city || community.name || '')}`)
    } catch {
      triggerAppNotification('Community joined', `You joined ${community.name}.`)
      toast.success(`You joined ${community.name}!`)
    }
  }

  const handleExitClick = (e: React.MouseEvent, community: CommunityCard) => {
    e.preventDefault()
    e.stopPropagation()
    setCommunityToExit(community)
  }

  const confirmExitCommunity = async () => {
    if (!communityToExit?.id) return
    persistJoinedIds(joinedIds.filter((id) => id !== communityToExit.id))
    try {
      if (!communityToExit.id.startsWith('sample-')) await leaveMutation.mutateAsync(communityToExit.id)
    } catch {
      // ignore remote errors in demo mode
    }
    triggerAppNotification('Community left', `You left ${communityToExit.name}.`)
    toast.success(`You left ${communityToExit.name}`)
    setCommunityToExit(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  const colors = [
    'from-purple-500 to-indigo-600',
    'from-indigo-500 to-purple-600',
    'from-violet-500 to-purple-600',
    'from-purple-600 to-pink-600',
    'from-blue-500 to-purple-600',
    'from-fuchsia-500 to-purple-600',
  ]

  return (
    <PortalBackground portal="communities">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 px-4 md:px-6 py-8"
      >
        {/* Hero Section */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 mb-8 border border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1, #4f46e5)' }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />

          {/* Animated Glow */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-bold mb-4 border border-white/30 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Active Groups
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-outfit font-black text-white tracking-tight mb-4 drop-shadow-lg"
              >
                Hometown Communities
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/95 text-lg max-w-xl leading-relaxed font-medium"
              >
                Discover and join local groups, share updates, and connect with people in your hometown who share your interests.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              <Link href="/communities/create">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-lg font-extrabold tracking-tight text-purple-700 shadow-2xl shadow-purple-950/40 ring-2 ring-white/70 hover:bg-purple-50 hover:text-purple-800 hover:ring-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white active:shadow-lg"
                >
                  <Plus className="w-5 h-5 stroke-[3] transition-transform duration-300 group-hover:rotate-90" />
                  Create Community
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
            <Input
              placeholder="Search communities by name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 h-14 rounded-2xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 shadow-lg"
            />
          </div>
          <Button
            onClick={() => toast.info('Type in the search box to find communities by name or keyword.')}
            variant="outline"
            className="h-14 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 rounded-2xl px-8 font-semibold shadow-lg"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </Button>
        </motion.div>

        {/* Communities Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
          </div>
        ) : isError ? (
          <motion.div variants={itemVariants} className="py-16 text-center text-red-300 bg-red-500/10 rounded-3xl border border-red-500/20 backdrop-blur-sm">
            <p className="text-lg font-semibold">Failed to load communities. Please try again.</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {visibleCommunities.map((community: CommunityCard, index: number) => {
              const color = colors[index % colors.length]
              const isJoined = Boolean(community.id && joinedIds.includes(community.id)) || community.membershipStatus === 'APPROVED'
              return (
                <motion.div key={community.id || community.slug} variants={itemVariants}>
                  <div>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:border-purple-400/50 transition-all group h-full flex flex-col relative shadow-xl hover:shadow-2xl hover:shadow-purple-500/20"
                    >
                      {/* Header Image */}
                      <div className={`h-36 bg-gradient-to-r ${color} relative overflow-hidden`}> 
                        <ImageWithFallback
                          src={community.bannerImage || community.logoImage || community.image}
                          alt={community.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>

                      <div className="p-6 flex-1 flex flex-col relative -mt-12">
                        {/* Icon */}
                        <motion.div
                          whileHover={{ rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} p-0.5 shadow-2xl mb-4 -mt-6`}
                        >
                          <div className="w-full h-full bg-[#0a0a0a] rounded-[15px] flex items-center justify-center">
                            <Users className="w-9 h-9 text-white" />
                          </div>
                        </motion.div>

                        {/* Content */}
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                          {community.name}
                        </h3>
                        <p className="text-gray-300 text-sm mb-6 flex-1 line-clamp-2">
                          {community.description}
                        </p>

                        {/* Footer Stats */}
                        <div className="flex items-center gap-4 text-sm mt-auto pt-4 border-t border-white/10">
                          <span className="flex items-center gap-1.5 text-purple-300 font-medium">
                            <Users className="w-4 h-4" />
                            {(community.memberCount || community.members || community._count?.members || 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
                            <MapPin className="w-4 h-4" />
                            {community.city || 'Citywide'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2.5 mt-4">
                          <div className="grid grid-cols-2 gap-2.5">
                            {isJoined ? (
                              <Button disabled className="h-11 w-full bg-emerald-600/15 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold shadow-lg cursor-not-allowed opacity-90">
                                <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" /> Joined
                              </Button>
                            ) : (
                              <Button onClick={(e) => handleJoin(e, community)} className="h-11 w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/25">
                                <MapIcon className="w-4 h-4 mr-1.5 shrink-0" /> Join
                              </Button>
                            )}
                            <Button onClick={(e) => { e.preventDefault(); window.location.href = `/communities/${community.slug}` }} className="h-11 w-full bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/25">
                              View
                            </Button>
                          </div>
                          {isJoined && (
                            <Button onClick={(e) => handleExitClick(e, community)} className="h-11 w-full bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/25">
                              <LogOut className="w-4 h-4 mr-1.5 shrink-0" /> Exit Community
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}

            {communities.length === 0 && (
              <motion.div
                variants={itemVariants}
                className="col-span-full py-16 text-center text-gray-300 bg-white/5 rounded-3xl border border-dashed border-white/20 backdrop-blur-sm"
              >
                <p className="text-lg">No communities found matching &quot;{searchQuery}&quot;</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
      <ConfirmDialog
        open={Boolean(communityToExit)}
        onOpenChange={(open) => !open && setCommunityToExit(null)}
        title="Exit community"
        description={`Are you sure you want to exit ${communityToExit?.name || 'this community'}?`}
        confirmLabel="Exit Community"
        confirmVariant="destructive"
        onConfirm={confirmExitCommunity}
      />
    </PortalBackground>
  )
}
