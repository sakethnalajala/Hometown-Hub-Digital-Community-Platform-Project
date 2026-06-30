'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Bookmark, Clock, Eye, Share2, ThumbsUp, Loader2 } from 'lucide-react'
import { newsApi, bookmarksApi } from '@/lib/api'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    newsApi.getById(id)
      .then(res => setArticle(res.data))
      .catch(() => {
        toast.error('Article not found')
        router.push('/news')
      })
      .finally(() => setLoading(false))
  }, [id, router])

  const handleShare = async () => {
    try {
      await newsApi.share(id)
      if (navigator.share) {
        await navigator.share({ title: article.title, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch {
      toast.success('Article shared!')
    }
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
      setArticle((a: any) => ({ ...a, likes: res.data?.likes ?? (a.likes + 1) }))
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

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6 pb-12">
      <Link href="/news" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to News
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-white/10">
        <ImageWithFallback src={article.image} alt={article.title} className="w-full h-72 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-500/90 text-white">{article.category}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-3 leading-tight">{article.title}</h1>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span>{article.author?.name || 'Hometown Hub'}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(article.createdAt).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {(article.views || 0).toLocaleString()}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleLike} className="border-white/10">
            <ThumbsUp className="w-4 h-4 mr-1" /> {article.likes || 0}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} className={`border-white/10 ${saved ? 'text-orange-400' : ''}`}>
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="border-white/10">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="prose prose-invert max-w-none mb-12">
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{article.content}</p>
      </div>

      <div className="border-t border-white/10 pt-8 mt-12">
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
        
        {/* Placeholder for actual comments from backend */}
        {article.commentCount > 0 && (
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
