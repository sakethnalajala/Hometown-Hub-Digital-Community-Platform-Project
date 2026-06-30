'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { PageWrapper, PageSection } from '@/components/ui/PageWrapper'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Calendar, MapPin, Users, Clock, Loader2, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function EventDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id),
  })

  const { data: participantsData } = useQuery({
    queryKey: ['event-participants', id],
    queryFn: () => eventsApi.getParticipants(id),
    enabled: !!id,
  })

  const rsvpMutation = useMutation({
    mutationFn: () => eventsApi.rsvp(id, 'GOING'),
    onSuccess: () => toast.success('You are registered for this event!'),
    onError: () => toast.error('Registration failed. Please try again.'),
  })

  if (isLoading) return <SkeletonCard className="h-96" />
  if (isError || !data?.data) {
    return (
      <div className="text-center py-20 glass-card rounded-3xl">
        <p className="text-muted-foreground mb-4">Event not found.</p>
        <Button asChild variant="outline"><Link href="/events"><ArrowLeft className="w-4 h-4 mr-2" />Back to Events</Link></Button>
      </div>
    )
  }

  const event = data.data
  const participants = participantsData?.data || []

  return (
    <PageWrapper className="max-w-4xl mx-auto space-y-6">
      <PageSection>
        <Button variant="ghost" size="sm" className="text-muted-foreground mb-4" asChild>
          <Link href="/events"><ArrowLeft className="w-4 h-4 mr-2" />Back to Events</Link>
        </Button>
      </PageSection>

      <PageSection>
        <div className="relative h-56 md:h-72 rounded-3xl overflow-hidden">
          <ImageWithFallback src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-orange-900/50 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div>
              <span className="badge bg-pink-500/20 text-pink-300 border-pink-500/30 mb-2">{event.category || 'Event'}</span>
              <h1 className="text-3xl font-bold text-white font-outfit">{event.title}</h1>
            </div>
            <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Event link copied to clipboard!');
            }}>
              Share
            </Button>
          </div>
        </div>
      </PageSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <PageSection>
            <div className="glass-card p-6">
              <h2 className="font-semibold text-white mb-3">About this event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          </PageSection>

          <PageSection>
            <div className="glass-card p-6">
              <h2 className="font-semibold text-white mb-4">Attendees ({participants.length || event._count?.participants || 0})</h2>
              <div className="flex flex-wrap gap-3">
                {participants.slice(0, 8).map((p: any) => (
                  <div key={p.id} className="flex items-center gap-2 bg-white/5 rounded-full pl-1 pr-3 py-1">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={p.profileImage} />
                      <AvatarFallback className="text-xs">{p.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-white">{p.name?.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </PageSection>
        </div>

        <div className="space-y-4">
          <PageSection>
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-xs text-muted-foreground">{event.time || format(new Date(event.date), 'h:mm a')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">{event.isOnline ? 'Online Event' : event.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">{event._count?.participants || 0} attending</p>
                  {event.maxParticipants && (
                    <p className="text-xs text-muted-foreground">Max {event.maxParticipants} participants</p>
                  )}
                </div>
              </div>
              {event.organizer && (
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={event.organizer.profileImage} />
                    <AvatarFallback>{event.organizer.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">Organized by</p>
                    <p className="text-sm font-medium text-white">{event.organizer.name}</p>
                  </div>
                </div>
              )}
              
              <div className="pt-3 border-t border-white/5">
                <p className="text-xs text-center text-orange-400 font-medium mb-2 animate-pulse">Starts in 3 days, 4 hours</p>
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl py-6 font-bold shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                  onClick={() => rsvpMutation.mutate()}
                  disabled={rsvpMutation.isPending}
                >
                  {rsvpMutation.isPending ? <Loader2 className="animate-spin" /> : 'Register for Event'}
                </Button>
              </div>
            </div>
          </PageSection>
        </div>
      </div>
    </PageWrapper>
  )
}
