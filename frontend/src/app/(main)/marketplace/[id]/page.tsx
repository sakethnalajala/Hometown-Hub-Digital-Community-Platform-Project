'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { marketplaceApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { PageWrapper, PageSection } from '@/components/ui/PageWrapper'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Star, ShoppingCart, ArrowLeft, MessageSquare, Check } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { isValidImageUrl } from '@/lib/images'
import type { MarketplaceReview } from '@/types'

/** Normalise the `images` field, which may arrive as an array or a JSON string. */
function parseImages(images: unknown): string[] {
  let list: unknown[] = []
  if (Array.isArray(images)) list = images
  else if (typeof images === 'string') {
    try { list = JSON.parse(images) } catch { list = images ? [images] : [] }
  }
  return list.filter(isValidImageUrl)
}

export default function MarketplaceDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [purchased, setPurchased] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => marketplaceApi.getById(id),
  })

  if (isLoading) return <SkeletonCard className="h-96" />
  if (isError || !data?.data) {
    return (
      <div className="text-center py-20 glass-card rounded-3xl">
        <p className="text-muted-foreground mb-4">Product not found.</p>
        <Button asChild variant="outline"><Link href="/marketplace"><ArrowLeft className="w-4 h-4 mr-2" />Back to Marketplace</Link></Button>
      </div>
    )
  }

  const product = data.data
  const images: string[] = parseImages(product.images)
  const reviews = Array.isArray(product.reviews) ? product.reviews : []
  const priceValue = Number(product.price)
  const priceLabel = Number.isFinite(priceValue) ? priceValue.toLocaleString() : '—'

  const handleBuyNow = () => {
    // Silent demo checkout — complete the purchase and reflect it purely in the
    // UI (button becomes "Purchased"). No toast, warning, or error is shown.
    setPurchased(true)
  }

  const handleContactSeller = () => {
    toast.success(`Message sent to ${product.seller?.name || 'the seller'}!`)
  }

  return (
    <PageWrapper className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
        <Link href="/marketplace"><ArrowLeft className="w-4 h-4 mr-2" />Back to Marketplace</Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PageSection>
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <ImageWithFallback src={images[0]} alt={product.name} className="w-full h-80 object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.slice(1, 5).map((img, i) => (
                <ImageWithFallback key={i} src={img} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
              ))}
            </div>
          )}
        </PageSection>

        <PageSection className="space-y-4">
          <span className="text-xs text-emerald-400 font-semibold uppercase">{product.category}</span>
          <h1 className="text-2xl font-bold text-white">{product.name}</h1>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white font-semibold">{product.rating?.toFixed(1) || '4.5'}</span>
            <span className="text-gray-500 text-sm">({reviews.length} reviews)</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">₹{priceLabel}</p>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {product.seller && (
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <Avatar>
                <AvatarImage src={product.seller.profileImage} />
                <AvatarFallback>{product.seller.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">{product.seller.name}</p>
                <p className="text-xs text-muted-foreground">Seller</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              className={`flex-1 transition-colors ${purchased ? 'bg-emerald-700 hover:bg-emerald-700 cursor-default' : 'bg-emerald-600 hover:bg-emerald-500'}`}
              onClick={handleBuyNow}
              disabled={purchased}
            >
              {purchased ? <Check className="w-4 h-4 mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
              {purchased ? 'Purchased' : 'Buy Now'}
            </Button>
            <Button variant="outline" className="border-white/10" onClick={handleContactSeller}>
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </PageSection>
      </div>

      {reviews.length > 0 && (
        <PageSection>
          <div className="glass-card p-6">
            <h2 className="font-semibold text-white mb-4">Reviews</h2>
            <div className="space-y-4">
              {reviews.map((r: MarketplaceReview) => (
                <div key={r.id} className="flex gap-3 border-b border-white/5 pb-4 last:border-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={r.author?.profileImage} />
                    <AvatarFallback>{r.author?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{r.author?.name}</span>
                      <span className="text-yellow-400 text-xs">{'★'.repeat(r.rating || 0)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageSection>
      )}
    </PageWrapper>
  )
}
