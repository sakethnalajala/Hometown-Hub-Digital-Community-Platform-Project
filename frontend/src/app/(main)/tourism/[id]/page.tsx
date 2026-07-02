'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { tourismApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { PageWrapper, PageSection } from '@/components/ui/PageWrapper'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Star, MapPin, Compass, ArrowLeft, Clock, Ticket, Building2, Heart, Navigation, Lightbulb, Phone, Landmark } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { openExternalLink, triggerAppNotification } from '@/lib/appHelpers'
import { getLocalDestinationById } from '@/lib/localDestinations'
import type { TourismSpot } from '@/types'

function getFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem('tourismFavorites') || '[]')
  } catch {
    return []
  }
}

export default function TourismDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [favorites, setFavorites] = useState<string[]>(getFavorites)
  const isLocalId = id?.startsWith('local-')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tourism', id],
    queryFn: () => tourismApi.getById(id),
    enabled: !isLocalId,
  })

  const [localPlace, setLocalPlace] = useState<TourismSpot | null>(null)
  useEffect(() => {
    // localStorage is unavailable during SSR, so this read is deliberately
    // deferred to an effect to keep the initial client render consistent.
    if (isLocalId) {
      const local = getLocalDestinationById(id)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalPlace(local)
    }
  }, [id, isLocalId])

  if (isLocalId) {
    if (!localPlace) return <SkeletonCard className="h-96" />
  } else {
    if (isLoading) return <SkeletonCard className="h-96" />
    if (isError || !data?.data) {
      return (
        <div className="text-center py-20 glass-card rounded-3xl">
          <p className="text-muted-foreground mb-4">Destination not found.</p>
          <Button asChild variant="outline"><Link href="/tourism"><ArrowLeft className="w-4 h-4 mr-2" />Back to Tourism</Link></Button>
        </div>
      )
    }
  }

  const place: TourismSpot = isLocalId ? localPlace! : data!.data!
  const images: string[] = place.images?.length ? place.images : (place.image ? [place.image] : [])
  const isFavorite = Boolean(place.id && favorites.includes(place.id))

  const toggleFavorite = () => {
    if (!place.id) return
    const next = isFavorite ? favorites.filter((f) => f !== place.id) : [...favorites, place.id]
    setFavorites(next)
    window.localStorage.setItem('tourismFavorites', JSON.stringify(next))
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites')
  }

  const handleGoogleMaps = () => {
    openExternalLink(place.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(`${place.name} ${place.location}`)}`)
  }

  const handleBookVisit = () => {
    triggerAppNotification('Visit booked', `Your visit to ${place.name} has been booked.`)
    toast.success(`Trip planned for ${place.name}! Check your notifications for details.`)
  }

  return (
    <PageWrapper className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
        <Link href="/tourism"><ArrowLeft className="w-4 h-4 mr-2" />Back to Tourism</Link>
      </Button>

      <PageSection>
        <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden">
          <ImageWithFallback src={images[0]} alt={place.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <button
            onClick={toggleFavorite}
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/90 backdrop-blur-md hover:bg-white transition-all shadow-lg"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
          <div className="absolute bottom-6 left-6 right-6">
            <span className="badge badge-primary mb-2">{(place.type || place.category)?.replace('_', ' ')}</span>
            <h1 className="text-3xl font-bold text-white font-outfit">{place.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-teal-400" /> {place.location}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-current" /> {place.rating} ({place.reviewCount || 0} reviews)</span>
            </div>
          </div>
        </div>
      </PageSection>

      {images.length > 1 && (
        <PageSection>
          <h2 className="text-lg font-semibold text-white mb-3">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <ImageWithFallback key={i} src={img} alt={`${place.name} ${i + 1}`} className="w-full h-32 rounded-xl object-cover" />
            ))}
          </div>
        </PageSection>
      )}

      <PageSection>
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold text-white">About this place</h2>
          <p className="text-muted-foreground leading-relaxed">{place.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-2.5 text-sm bg-white/5 rounded-xl p-3 border border-white/10">
              <Ticket className="w-4 h-4 text-teal-400 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Entry Fee</p>
                <p className="text-white font-medium">{place.entryFee || 'Free'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm bg-white/5 rounded-xl p-3 border border-white/10">
              <Clock className="w-4 h-4 text-teal-400 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Opening Hours</p>
                <p className="text-white font-medium">{place.openingTime || 'Open year-round'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm bg-white/5 rounded-xl p-3 border border-white/10">
              <Compass className="w-4 h-4 text-teal-400 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Best Time to Visit</p>
                <p className="text-white font-medium">{place.bestSeason || place.bestTime || 'Year-round'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button className="bg-teal-600 hover:bg-teal-500" onClick={handleBookVisit}>
              <Compass className="w-4 h-4 mr-2" /> Book Visit
            </Button>
            <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={handleGoogleMaps}>
              <Navigation className="w-4 h-4 mr-2" /> Google Maps
            </Button>
            <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={toggleFavorite}>
              <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} /> {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </Button>
          </div>
        </div>
      </PageSection>

      {(place.travelTips || place.contactInfo) && (
        <PageSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {place.travelTips && (
              <div className="glass-card p-5 space-y-2">
                <h2 className="font-semibold text-white flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-400" /> Travel Tips</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{place.travelTips}</p>
              </div>
            )}
            {place.contactInfo && (
              <div className="glass-card p-5 space-y-2">
                <h2 className="font-semibold text-white flex items-center gap-2"><Phone className="w-4 h-4 text-teal-400" /> Contact Information</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{place.contactInfo}</p>
              </div>
            )}
          </div>
        </PageSection>
      )}

      {!!place.nearbyAttractions?.length && (
        <PageSection>
          <div className="glass-card p-6 space-y-3">
            <h2 className="font-semibold text-white flex items-center gap-2"><Landmark className="w-4 h-4 text-teal-400" /> Nearby Attractions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {place.nearbyAttractions.map((attraction) => (
                <div key={attraction} className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 rounded-xl p-3 border border-white/10">
                  <Landmark className="w-4 h-4 text-teal-400 shrink-0" /> {attraction}
                </div>
              ))}
            </div>
          </div>
        </PageSection>
      )}

      {!!place.nearbyHotels?.length && (
        <PageSection>
          <div className="glass-card p-6 space-y-3">
            <h2 className="font-semibold text-white flex items-center gap-2"><Building2 className="w-4 h-4 text-teal-400" /> Nearby Hotels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {place.nearbyHotels.map((hotel) => (
                <div key={hotel} className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 rounded-xl p-3 border border-white/10">
                  <Building2 className="w-4 h-4 text-teal-400 shrink-0" /> {hotel}
                </div>
              ))}
            </div>
          </div>
        </PageSection>
      )}

      {!!place.reviews?.length && (
        <PageSection>
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold text-white">Reviews</h2>
            <div className="space-y-3">
              {place.reviews.map((review) => (
                <div key={review.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-medium text-sm">{review.author}</p>
                    <span className="flex items-center gap-1 text-yellow-400 text-xs">
                      <Star className="w-3.5 h-3.5 fill-current" /> {review.rating}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </PageSection>
      )}
    </PageWrapper>
  )
}
