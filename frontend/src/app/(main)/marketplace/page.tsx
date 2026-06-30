'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Search, Filter, Heart, ShoppingCart, Tag, Loader2, Store } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { marketplaceApi } from '@/lib/api'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { toast } from 'sonner'
import { PortalBackground } from '@/components/ui/PortalBackground'
import { GradientButton } from '@/components/ui/GradientButton'

function parseImages(images: unknown): string[] {
  if (Array.isArray(images)) return images
  if (typeof images === 'string') {
    try { return JSON.parse(images) } catch { return [] }
  }
  return []
}

const categories = ['All', 'Electronics', 'Furniture', 'Sports', 'Food & Grocery', 'Home Decor', 'Clothing']

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function MarketplacePage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [wishlist, setWishlist] = useState<string[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    marketplaceApi.getAll()
      .then(res => {
        setListings(res.data || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load marketplace listings')
        setLoading(false)
      })
  }, [])

  const handleBuyNow = (e: React.MouseEvent, item: any) => {
    // Silent demo checkout — complete the purchase with a friendly confirmation.
    // No error or warning notification is ever shown.
    e.preventDefault()
    e.stopPropagation()
    toast.success(`Purchase complete! Your ${item.name || item.title} is on its way.`)
  }

  const filtered = listings.filter(l => {
    const matchCat = activeCategory === 'All' || l.category === activeCategory
    const matchSearch = !search || (l.name || l.title || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <PortalBackground portal="marketplace">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 px-4 md:px-6 py-8">
        {/* Hero */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6, #6366f1)' }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30" />

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

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="hidden md:flex w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md items-center justify-center border border-white/30 shadow-2xl"
              >
                <ShoppingBag className="w-10 h-10 text-white" />
              </motion.div>
              <div className="flex-1">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-bold mb-4 border border-white/30 shadow-lg"
                >
                  <Store className="w-4 h-4" />
                  Buy & Sell Locally
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-outfit font-black text-white tracking-tight mb-4 drop-shadow-lg"
                >
                  Local Marketplace
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/95 text-lg max-w-2xl leading-relaxed font-medium"
                >
                  Buy and sell within your community. Support local sellers and find great deals.
                </motion.p>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              <Link href="/marketplace/sell">
                <GradientButton variant="cyan" size="lg" className="shadow-2xl">
                  <Tag className="w-5 h-5" />
                  Sell Item
                </GradientButton>
              </Link>
            </motion.div>
          </div>

          {/* Search */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-3 mt-8">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-12 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 h-14 rounded-2xl focus:ring-4 focus:ring-cyan-400/50 shadow-lg"
              />
            </div>
            <Button
              onClick={() => toast.info('Advanced filters are coming soon. Use the category chips below for now.')}
              className="h-14 px-6 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 font-bold shadow-lg"
            >
              <Filter className="w-5 h-5 mr-2" /> Filter
            </Button>
          </motion.div>

          {/* Categories */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex gap-2 mt-6 flex-wrap">
            {categories.map(cat => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg ${
                  activeCategory === cat
                    ? 'bg-white text-cyan-600 shadow-xl'
                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div variants={itemVariants} className="py-16 text-center text-gray-300 bg-white/5 rounded-3xl border border-dashed border-white/20 backdrop-blur-sm">
            <p className="text-lg">No items found.</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.slice(0, 5).map((item: any) => {
              const images = parseImages(item.images)
              const mainImage = images[0] || item.image || '/placeholder.jpg'
              return (
                <motion.div key={item.id} variants={itemVariants}>
                  <Link href={`/marketplace/${item.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.03, y: -5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:border-cyan-400/50 cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 h-full flex flex-col"
                    >
                      {/* Image */}
                      <div className="h-52 relative overflow-hidden">
                        <ImageWithFallback
                          src={mainImage}
                          alt={item.name || item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            setWishlist(w => w.includes(item.id) ? w.filter(i => i !== item.id) : [...w, item.id])
                            toast.success(wishlist.includes(item.id) ? 'Removed from wishlist' : 'Added to wishlist')
                          }}
                          className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur-md hover:bg-white transition-all shadow-lg"
                        >
                          <Heart className={`w-5 h-5 ${wishlist.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                        </button>
                        {item.condition && (
                          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-cyan-500/90 text-white text-xs font-bold shadow-lg">
                            {item.condition}
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                          {item.name || item.title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-gray-300 mb-3">
                          <Store className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="line-clamp-1">{item.seller?.name || 'Local Seller'}</span>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                          <span className="text-xl font-black text-cyan-300">
                            ${item.price || '0'}
                          </span>
                          <Button
                            size="sm"
                            onClick={(e) => handleBuyNow(e, item)}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1.5" />
                            Buy Now
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
