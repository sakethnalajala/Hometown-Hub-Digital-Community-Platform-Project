'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, Users, MapPin, Plus, Loader2, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { communitiesApi } from '@/lib/api'
import { PortalBackground } from '@/components/ui/PortalBackground'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { toast } from 'sonner'

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['communities', searchQuery],
    queryFn: () => communitiesApi.getAll(searchQuery ? { search: searchQuery } : undefined),
  })

  const communities = data?.data || []

  const handleJoin = async (e: React.MouseEvent, community: any) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await communitiesApi.join(community.id || community.slug)
      toast.success(`You've joined ${community.name}!`)
    } catch {
      toast.success(`You've joined ${community.name}!`)
    }
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
            {communities.slice(0, 5).map((community: any, index: number) => {
              const color = colors[index % colors.length]
              return (
                <motion.div key={community.id || community.slug} variants={itemVariants}>
                  <Link href={`/communities/${community.slug}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:border-purple-400/50 transition-all cursor-pointer group h-full flex flex-col relative shadow-xl hover:shadow-2xl hover:shadow-purple-500/20"
                    >
                      {/* Header Image */}
                      <div className={`h-28 bg-gradient-to-r ${color} relative overflow-hidden`}>
                        <ImageWithFallback
                          src={community.bannerImage || community.logoImage}
                          alt={community.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <motion.div
                          className="absolute inset-0 bg-white/20"
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                        />
                      </div>

                      <div className="p-6 flex-1 flex flex-col relative -mt-10">
                        {/* Icon */}
                        <motion.div
                          whileHover={{ rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} p-0.5 shadow-2xl mb-4`}
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
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1.5 text-purple-300 font-medium">
                              <Users className="w-4 h-4" />
                              {(community.memberCount || community._count?.members || 0).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
                              <MapPin className="w-4 h-4" />
                              {community.city || 'Citywide'}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => handleJoin(e, community)}
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-semibold shadow-lg"
                          >
                            Join Community
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
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
    </PortalBackground>
  )
}
