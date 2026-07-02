'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Star, MapPin, Compass, Loader2, Navigation, Trash2, Heart, Plus, Pencil, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { tourismApi } from '@/lib/api'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { toast } from 'sonner'
import { PortalBackground } from '@/components/ui/PortalBackground'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { GradientButton } from '@/components/ui/GradientButton'
import { DestinationFormModal, type DestinationFormValues } from '@/components/ui/DestinationFormModal'
import { triggerAppNotification } from '@/lib/appHelpers'
import {
  getLocalDestinations,
  addLocalDestination,
  updateLocalDestination,
  deleteLocalDestination,
  type LocalDestination,
} from '@/lib/localDestinations'

function parseImages(images: unknown): string[] {
  if (Array.isArray(images)) return images
  if (typeof images === 'string') {
    try { return JSON.parse(images) } catch { return [] }
  }
  return []
}

interface TourismDestination {
  id?: string
  name?: string
  description?: string
  rating?: number
  location?: string
  city?: string
  category?: string
  type?: string
  image?: string
  images?: unknown
  bestTime?: string
  bestSeason?: string
  isLocal?: boolean
}

const types = ['All', 'Nature', 'Heritage', 'Hill Station', 'Wildlife', 'Beach', 'Adventure']

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

function placeholderImage(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`
}

export default function TourismPage() {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('All')
  const [destinations, setDestinations] = useState<TourismDestination[]>([])
  const [localDestinations, setLocalDestinations] = useState<LocalDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [destinationToDelete, setDestinationToDelete] = useState<TourismDestination | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingDestination, setEditingDestination] = useState<LocalDestination | null>(null)
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(window.localStorage.getItem('tourismFavorites') || '[]')
    } catch {
      return []
    }
  })

  const toggleFavorite = (e: React.MouseEvent, destId?: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!destId) return
    const next = favorites.includes(destId) ? favorites.filter((f) => f !== destId) : [...favorites, destId]
    setFavorites(next)
    window.localStorage.setItem('tourismFavorites', JSON.stringify(next))
    toast.success(favorites.includes(destId) ? 'Removed from favorites' : 'Added to favorites')
  }

  useEffect(() => {
    // localStorage is unavailable during SSR, so this read is deliberately
    // deferred to an effect to keep the initial client render consistent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalDestinations(getLocalDestinations())
    tourismApi.getAll({ limit: 100 })
      .then(res => {
        setDestinations(res.data || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load tourism destinations')
        setLoading(false)
      })
  }, [])

  // Local (user-created) destinations are shown first, followed by the catalog.
  const combined = useMemo<TourismDestination[]>(
    () => [...localDestinations, ...destinations],
    [localDestinations, destinations]
  )

  const handleCreateClick = () => {
    setEditingDestination(null)
    setFormOpen(true)
  }

  const handleEditClick = (e: React.MouseEvent, dest: TourismDestination) => {
    e.preventDefault()
    e.stopPropagation()
    const local = localDestinations.find((d) => d.id === dest.id)
    if (!local) return
    setEditingDestination(local)
    setFormOpen(true)
  }

  const handleFormSubmit = (values: DestinationFormValues) => {
    const image = values.image.trim() || placeholderImage(values.name)
    if (editingDestination) {
      updateLocalDestination(editingDestination.id, {
        name: values.name,
        category: values.category,
        type: values.category,
        location: values.location,
        description: values.description,
        bestSeason: values.bestSeason || 'Year-round',
        bestTime: values.bestSeason || 'Year-round',
        rating: values.rating,
        image,
      })
      toast.success(`${values.name} updated successfully`)
      triggerAppNotification('Destination updated', `${values.name} was updated.`)
    } else {
      addLocalDestination({
        name: values.name,
        category: values.category,
        type: values.category,
        location: values.location,
        description: values.description,
        bestSeason: values.bestSeason || 'Year-round',
        bestTime: values.bestSeason || 'Year-round',
        rating: values.rating,
        image,
      })
      toast.success(`${values.name} added to Tourism!`)
      triggerAppNotification('Destination created', `${values.name} was added to Tourism.`)
    }
    setLocalDestinations(getLocalDestinations())
    setEditingDestination(null)
  }

  const handleDelete = (e: React.MouseEvent, destination: TourismDestination) => {
    e.preventDefault()
    e.stopPropagation()
    setDestinationToDelete(destination)
  }

  const confirmDelete = () => {
    if (!destinationToDelete?.id) return
    deleteLocalDestination(destinationToDelete.id)
    setLocalDestinations(getLocalDestinations())
    triggerAppNotification('Destination deleted', `${destinationToDelete.name} was removed.`)
    toast.success(`${destinationToDelete.name} deleted`)
    setDestinationToDelete(null)
  }

  const filtered = combined.filter(d => {
    const matchType = activeType === 'All' || d.type === activeType || d.category === activeType
    const q = search.trim().toLowerCase()
    const matchSearch = !q
      || (d.name || '').toLowerCase().includes(q)
      || (d.location || d.city || '').toLowerCase().includes(q)
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
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
              <div className="flex items-start gap-6">
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
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="shrink-0"
              >
                <GradientButton variant="green" size="lg" className="group shadow-2xl" onClick={handleCreateClick}>
                  <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                  Create Destination
                </GradientButton>
              </motion.div>
            </div>

            {/* Search */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex gap-3 mt-6">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" />
                <Input
                  placeholder="Search by destination name or location..."
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
          <>
            <motion.p variants={itemVariants} className="text-sm text-gray-400">
              Showing {filtered.length} destination{filtered.length === 1 ? '' : 's'}
            </motion.p>
            <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filtered.map((dest: TourismDestination) => {
                const images = parseImages(dest.images)
                const mainImage = images[0] || dest.image || placeholderImage(dest.name || 'destination')
                const isLocal = Boolean(dest.isLocal)
                return (
                  <motion.div key={dest.id} variants={itemVariants} className="h-full">
                    <Link href={`/tourism/${dest.id}`} className="h-full block">
                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:border-emerald-400/50 transition-colors cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 h-full flex flex-col"
                      >
                        {/* Image */}
                        <div className="h-56 relative overflow-hidden shrink-0">
                          <ImageWithFallback
                            src={mainImage}
                            alt={dest.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <div className="px-3 py-2 rounded-xl bg-emerald-500/90 text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                              {dest.type || dest.category || 'Nature'}
                            </div>
                            <button
                              onClick={(e) => toggleFavorite(e, dest.id)}
                              className="p-2 rounded-xl bg-white/90 backdrop-blur-md hover:bg-white transition-all shadow-lg shrink-0"
                            >
                              <Heart className={`w-4 h-4 ${dest.id && favorites.includes(dest.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                            </button>
                          </div>
                          {isLocal && (
                            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-indigo-500/90 text-white text-[11px] font-bold shadow-lg">
                              Your Listing
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md text-emerald-600 text-xs font-bold shadow-lg">
                            <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                            {dest.rating || '4.5'}
                          </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors line-clamp-1">
                            {dest.name}
                          </h3>

                          <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="line-clamp-1">{dest.location || dest.city || 'Local'}</span>
                          </div>

                          <p className="text-sm text-gray-300 line-clamp-3 mb-4 flex-1">
                            {dest.description}
                          </p>

                          <div className="flex items-center gap-1.5 text-xs text-teal-300 font-semibold mb-4">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span className="line-clamp-1">{dest.bestSeason || dest.bestTime || 'Year Round'}</span>
                          </div>

                          <div className={`grid gap-2.5 pt-4 border-t border-white/10 ${isLocal ? 'grid-cols-3' : 'grid-cols-1'}`}>
                            {/* Navigation is handled by the wrapping Link; this button is the visible affordance */}
                            <Button className="h-10 w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold shadow-lg">
                              Explore
                            </Button>
                            {isLocal && (
                              <>
                                <Button
                                  className="h-10 w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-bold shadow-lg"
                                  onClick={(e) => handleEditClick(e, dest)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  className="h-10 w-full bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg"
                                  onClick={(e) => handleDelete(e, dest)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </>
        )}
      </motion.div>
      <ConfirmDialog
        open={Boolean(destinationToDelete)}
        onOpenChange={(open) => !open && setDestinationToDelete(null)}
        title="Delete destination"
        description={`Delete ${destinationToDelete?.name || 'this destination'}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      />
      <DestinationFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        editing={editingDestination}
      />
    </PortalBackground>
  )
}
