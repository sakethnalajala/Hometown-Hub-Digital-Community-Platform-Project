'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Newspaper, Search, Bookmark, Share2, Clock, Eye, TrendingUp, Tag, Loader2, Sparkles, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { newsApi, bookmarksApi } from '@/lib/api'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { toast } from 'sonner'
import { PortalBackground } from '@/components/ui/PortalBackground'

const categories = ['All', 'Politics', 'Education', 'Technology', 'Healthcare', 'Environment', 'Transportation', 'Business', 'Sports', 'Culture']

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function NewsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [saved, setSaved] = useState<string[]>([])
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    newsApi.getAll({ limit: 100 })
      .then(res => {
        setNews(res.data || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load news')
        setLoading(false)
      })
  }, [])

  const filtered = news.filter(n => {
    const matchCat = activeCategory === 'All' || n.category === activeCategory
    const matchSearch = !search || (n.title || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const featured = filtered.find(n => n.isFeatured || n.trending) || filtered[0]
  const rest = filtered.filter(n => n.id !== featured?.id)

  return (
    <PortalBackground portal="news">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 px-4 md:px-6 py-8">
        {/* Hero */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #ef4444, #be123c, #dc2626)' }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30" />

          <div className="relative z-10">
            <div className="flex items-start gap-6 mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="hidden md:flex w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md items-center justify-center border border-white/30 shadow-2xl"
              >
                <Newspaper className="w-10 h-10 text-white" />
              </motion.div>
              <div className="flex-1">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-bold mb-4 border border-white/30 shadow-lg"
                >
                  <Zap className="w-4 h-4" />
                  Breaking News
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-outfit font-black text-white tracking-tight mb-4 drop-shadow-lg"
                >
                  Local News
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/95 text-lg max-w-2xl leading-relaxed font-medium"
                >
                  Stay updated with your community&apos;s latest happenings and breaking stories.
                </motion.p>
              </div>
            </div>

            {/* Search */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex gap-3 mt-6">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-300" />
                <Input
                  placeholder="Search news articles..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-12 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 h-14 rounded-2xl focus:ring-4 focus:ring-red-400/50 shadow-lg"
                />
              </div>
            </motion.div>

            {/* Categories */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-2 mt-6 flex-wrap">
              {categories.map(cat => (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg ${
                    activeCategory === cat
                      ? 'bg-white text-red-600 shadow-xl'
                      : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20'
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-red-400" />
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <motion.div variants={itemVariants}>
                <Link href={`/news/${featured.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.01, y: -4 }}
                    className="relative overflow-hidden rounded-3xl border border-white/20 group cursor-pointer shadow-2xl hover:shadow-red-500/20"
                  >
                    <div className="relative h-96">
                      <ImageWithFallback
                        src={featured.image}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    </div>
                    <div className="absolute top-6 left-6 flex gap-3">
                      <span className="flex items-center gap-2 bg-red-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-xl">
                        <TrendingUp className="w-4 h-4" /> TRENDING
                      </span>
                      <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/30">
                        {featured.category || 'General'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">{featured.title}</h2>
                      <p className="text-gray-200 text-base line-clamp-2 mb-4">{featured.content || featured.summary || ''}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-300">
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(featured.publishedAt || featured.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> {featured.views || 0} views</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            )}

            {/* Grid */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.slice(0, 6).map((article: any) => (
                <motion.div key={article.id} variants={itemVariants}>
                  <Link href={`/news/${article.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:border-red-400/50 cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-red-500/20 h-full flex flex-col"
                    >
                      <div className="h-48 relative overflow-hidden">
                        <ImageWithFallback
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-red-500/90 text-white text-xs font-bold shadow-lg">
                          {article.category || 'News'}
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-red-300 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-300 line-clamp-2 mb-4 flex-1">
                          {article.content || article.summary || ''}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-white/10">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {article.views || 0}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </motion.div>
    </PortalBackground>
  )
}
