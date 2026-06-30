'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Map, Search, Star, MapPin, Camera, Clock, Compass, Mountain, TreePine, Landmark, Loader2, Sparkles, Navigation } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { tourismApi } from '@/lib/api'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { toast } from 'sonner'
import { PortalBackground } from '@/components/ui/PortalBackground'

function parseImages(images: unknown): string[] {
  if (Array.isArray(images)) return images
  if (typeof images === 'string') {
    try { return JSON.parse(images) } catch { return [] }
  }
  return []
}

const types = ['All', 'Nature', 'Heritage', 'Hill Station', 'Wildlife', 'Beach', 'Adventure']

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function TourismPage() {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('All')
  const [destinations, setDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tourismApi.getAll()
      .then(res => {
        setDestinations(res.data || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load tourism destinations')
        setLoading(false)
      })
  }, [])

  const filtered = destinations.filter(d => {
    const matchType = activeType === 'All' || d.type === activeType || d.category === activeType
    const matchSearch = !search || (d.name || '').toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <PortalBackground portal="tourism">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 px-4 md:px-6 py-8">
        {/* Hero */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #22c55e, #10b981, #14b8a6)' }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />

          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <div className="relative z-10">
            <div className="flex items-start gap-6 mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="hidden md:flex w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md items-center justify-center border border-white/30 shadow-2xl"
              >
                <Compass className="w-10 h-10 text-white" />
              </motion.div>
              <div className="flex-1">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-bold mb-4 border border-white/30 shadow-lg"
                >
                  <Navigation className="w-4 h-4" />
                  Explore Destinations
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-outfit font-black text-white tracking-tight mb-4 drop-shadow-lg"
                >
                  Local Tourism & Travel
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/95 text-lg max-w-2xl leading-relaxed font-medium"
                >
                  Discover hidden gems, trails, and breathtaking destinations near your hometown.
                </motion.p>
              </div>
            </div>

            {/* Search */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex gap-3 mt-6">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" />
                <Input
                  placeholder="Search destinations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-12 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 h-14 rounded-2xl focus:ring-4 focus:ring-emerald-400/50 shadow-lg"
                />
              </div>
            </motion.div>

            {/* Types */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-2 mt-6 flex-wrap">
              {types.map(type => (
                <motion.button
                  key={type}
                  onClick={() => setActiveType(type)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg ${
                    activeType === type
                      ? 'bg-white text-emerald-600 shadow-xl'
                      : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20'
                  }`}
                >
                  {type}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div variants={itemVariants} className="py-16 text-center text-gray-300 bg-white/5 rounded-3xl border border-dashed border-white/20 backdrop-blur-sm">
            <p className="text-lg">No destinations found.</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.slice(0, 6).map((dest: any) => {
              const images = parseImages(dest.images)
              const mainImage = images[0] || dest.image || '/placeholder-tourism.jpg'
              return (
                <motion.div key={dest.id} variants={itemVariants}>
                  <Link href={`/tourism/${dest.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:border-emerald-400/50 cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 h-full flex flex-col"
                    >
                      {/* Image */}
                      <div className="h-56 relative overflow-hidden">
                        <ImageWithFallback
                          src={mainImage}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 px-3 py-2 rounded-xl bg-emerald-500/90 text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                          {dest.type || dest.category || 'Nature'}
                        </div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md text-emerald-600 text-xs font-bold shadow-lg">
                          <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                          {dest.rating || '4.5'}
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                          {dest.name}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          <span className="line-clamp-1">{dest.location || dest.city || 'Local'}</span>
                        </div>

                        <p className="text-sm text-gray-300 line-clamp-3 mb-4 flex-1">
                          {dest.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <span className="text-sm text-teal-300 font-semibold">
                            {dest.bestTime || 'Year Round'}
                          </span>
                          <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold shadow-lg">
                            Explore
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </motion.div>
    </PortalBackground>
  )
}
