'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { tourismApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { PageWrapper, PageSection } from '@/components/ui/PageWrapper'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Star, MapPin, Compass, ArrowLeft, Clock } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function TourismDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tourism', id],
    queryFn: () => tourismApi.getById(id),
  })

  if (isLoading) return <SkeletonCard className="h-96" />
  if (isError || !data?.data) {
    return (
      <div className="text-center py-20 glass-card rounded-3xl">
        <p className="text-muted-foreground mb-4">Destination not found.</p>
        <Button asChild variant="outline"><Link href="/tourism"><ArrowLeft className="w-4 h-4 mr-2" />Back to Tourism</Link></Button>
      </div>
    )
  }

  const place = data.data
  const images: string[] = Array.isArray(place.images) ? place.images : []

  return (
    <PageWrapper className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
        <Link href="/tourism"><ArrowLeft className="w-4 h-4 mr-2" />Back to Tourism</Link>
      </Button>

      <PageSection>
        <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden">
          <ImageWithFallback src={images[0]} alt={place.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="badge badge-primary mb-2">{place.type?.replace('_', ' ')}</span>
            <h1 className="text-3xl font-bold text-white font-outfit">{place.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-teal-400" /> {place.location}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-current" /> {place.rating}</span>
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
          <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-teal-400" /> Open year-round</span>
            <span className="flex items-center gap-1.5"><Compass className="w-4 h-4 text-teal-400" /> Guided tours available</span>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-500 mt-4" onClick={() => toast.success(`Trip plan started for ${place.name}!`)}>
            <Compass className="w-4 h-4 mr-2" /> Plan Your Visit
          </Button>
        </div>
      </PageSection>
    </PageWrapper>
  )
}
