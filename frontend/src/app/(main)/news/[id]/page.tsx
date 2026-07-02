'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Bookmark, Clock, Eye, Share2, ThumbsUp, Loader2, MapPin,
  Tag, Newspaper, History, MessageCircle, Link2,
} from 'lucide-react'
import { newsApi, bookmarksApi } from '@/lib/api'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { NewsArticle } from '@/types'

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [related, setRelated] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [shareMenuOpen, setShareMenuOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    newsApi.getById(id)
      .then(res => setArticle(res.data ?? null))
      .catch(() => {
        toast.error('Article not found')
        router.push('/news')
      })
      .finally(() => setLoading(false))
  }, [id, router])

  useEffect(() => {
    if (!article?.category) return
    newsApi.getAll({ category: article.category, limit: 6 })
      .then(res => setRelated((res.data || []).filter((a) => a.id !== article.id).slice(0, 3)))
      .catch(() => setRelated([]))
  }, [article?.category, article?.id])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleShare = async () => {
    if (!article?.title) return
    try {
      await newsApi.share(id)
    } catch {
      // demo mode / API unavailable
    }
    setShareMenuOpen((v) => !v)
  }

  const shareTo = (platform: 'twitter' | 'facebook' | 'whatsapp' | 'linkedin' | 'copy') => {
    const text = encodeURIComponent(article?.title || 'Check out this article')
    const url = encodeURIComponent(shareUrl)
    const targets: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    }
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    } else {
      window.open(targets[platform], '_blank', 'noopener,noreferrer,width=600,height=500')
    }
    setShareMenuOpen(false)
  }

  const handleSave = async () => {
    try {
      const res = await bookmarksApi.toggle('news', id)
      setSaved(!!res.data?.saved)
      toast.success(res.data?.saved ? 'Article saved!' : 'Removed from saved')
    } catch {
      setSaved(!saved)
      toast.success(saved ? 'Removed from saved' : 'Article saved!')
    }
  }

  const handleLike = async () => {
    try {
      const res = await newsApi.like(id)
      setArticle((current) => current ? ({ ...current, likes: res.data?.likes ?? ((current.likes ?? 0) + 1) }) : current)
      toast.success('Liked!')
    } catch {
      toast.error('Could not like article')
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!article) return null

  const authorName = (typeof article.author === 'string' ? article.author : article.author?.name) || 'Hometown Hub'

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6 pb-12 px-4 md:px-0">
      <Link href="/news" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to News
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-white/10">
        <ImageWithFallback src={article.image} alt={article.title || 'Article image'} className="w-full h-80 md:h-96 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-500/90 text-white">{article.category}</span>
          <h1 className="text-2xl md:text-4xl font-bold text-white mt-3 leading-tight">{article.title}</h1>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between flex-wrap gap-4 text-sm text-gray-400 border-b border-white/10 pb-5">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-medium text-gray-200">{authorName}</span>
          {article.createdAt && (
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Published {new Date(article.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          )}
          {article.updatedAt && (
            <span className="flex items-center gap-1"><History className="w-3.5 h-3.5" /> Updated {new Date(article.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' })}</span>
          )}
          {article.readTime && (
            <span className="flex items-center gap-1"><Newspaper className="w-3.5 h-3.5" /> {article.readTime}</span>
          )}
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {(article.views || 0).toLocaleString()}</span>
          {article.location && (
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {article.location}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleLike} className="border-white/10">
            <ThumbsUp className="w-4 h-4 mr-1" /> {article.likes || 0}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} className={`border-white/10 ${saved ? 'text-orange-400' : ''}`}>
            <Bookmark className="w-4 h-4 mr-1" /> {saved ? 'Saved' : 'Bookmark'}
          </Button>
        </div>
        <div className="relative">
          <Button variant="outline" size="sm" onClick={handleShare} className="border-white/10">
            <Share2 className="w-4 h-4 mr-1" /> Share
          </Button>
          {shareMenuOpen && (
            <div className="absolute right-0 z-20 mt-2 flex gap-1.5 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
              <button onClick={() => shareTo('twitter')} aria-label="Share on X (Twitter)" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-sky-400 text-xs font-bold">X</button>
              <button onClick={() => shareTo('facebook')} aria-label="Share on Facebook" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-blue-500 text-xs font-bold">FB</button>
              <button onClick={() => shareTo('whatsapp')} aria-label="Share on WhatsApp" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-green-400"><MessageCircle className="w-4 h-4" /></button>
              <button onClick={() => shareTo('linkedin')} aria-label="Share on LinkedIn" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-blue-400 text-xs font-bold">in</button>
              <button onClick={() => shareTo('copy')} aria-label="Copy link" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"><Link2 className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>

      {/* Article body */}
      <div className="prose prose-invert max-w-none">
        {(article.content || '').split('\n\n').map((para, idx) => {
          const isSubheading = para.length < 40 && !para.endsWith('.') && !para.endsWith('"')
          return isSubheading ? (
            <h2 key={idx} className="text-lg font-bold text-white mt-8 mb-2">{para}</h2>
          ) : (
            <p key={idx} className="text-gray-300 leading-relaxed mb-4">{para}</p>
          )
        })}
      </div>

      {article.source && (
        <p className="text-xs text-gray-500 italic">Source: {article.source}</p>
      )}

      {/* Tags */}
      {!!article.tags?.length && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Tag className="w-4 h-4 text-gray-500" />
          {article.tags.map((tag) => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">{tag}</span>
          ))}
        </div>
      )}

      {/* Related news */}
      {related.length > 0 && (
        <div className="border-t border-white/10 pt-8">
          <h2 className="text-xl font-bold text-white mb-4">Related News</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={`/news/${r.id}`} className="group rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-orange-400/40 transition-colors">
                <div className="h-28 overflow-hidden">
                  <ImageWithFallback src={r.image} alt={r.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-white line-clamp-2 group-hover:text-orange-300">{r.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-white/10 pt-8 mt-4">
        <h2 className="text-xl font-bold text-white mb-6">Comments ({article.commentCount || 0})</h2>
        <div className="glass-card p-6 rounded-2xl mb-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 shrink-0"></div>
            <div className="flex-1">
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-orange-500/50 min-h-[100px]"
                placeholder="Share your thoughts on this article..."
              ></textarea>
              <div className="flex justify-end mt-3">
                <Button className="bg-orange-600 hover:bg-orange-500 text-white" onClick={() => toast.success('Comment posted!')}>Post Comment</Button>
              </div>
            </div>
          </div>
        </div>

        {(article.commentCount || 0) > 0 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                <div>
                  <p className="text-sm font-medium text-white">Local Resident</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">Great initiative! This will really help the community.</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
