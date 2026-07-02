'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar, MapPin, Users, Plus, Ticket, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { PortalBackground } from '@/components/ui/PortalBackground'
import { GradientButton } from '@/components/ui/GradientButton'
import { EventRegistrationModal } from '@/components/ui/EventRegistrationModal'
import { InvitationCardModal } from '@/components/ui/InvitationCard'
import { saveInvitation, getInvitationByEventId, type EventInvitation } from '@/lib/invitations'
import type { Event } from '@/types'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function EventsPage() {
  const queryClient = useQueryClient()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const [invitation, setInvitation] = useState<EventInvitation | null>(null)
  const [invitationOpen, setInvitationOpen] = useState(false)
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = window.localStorage.getItem('registeredEventIds')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.getAll({ limit: 80 }),
  })

  const events = data?.data || []

  const saveRegisteredEvent = (eventId: string) => {
    setRegisteredEventIds((current) => {
      const updated = Array.from(new Set([...current, eventId]))
      window.localStorage.setItem('registeredEventIds', JSON.stringify(updated))
      return updated
    })
  }

  const handleRegister = (e: React.MouseEvent, event: Event) => {
    e.preventDefault()
    e.stopPropagation()
    if (registeredEventIds.includes(event.id)) {
      const existing = getInvitationByEventId(event.id)
      if (existing) {
        setInvitation(existing)
        setInvitationOpen(true)
        return
      }
    }
    setSelectedEvent(event)
    setRegistrationOpen(true)
  }

  const handleRegistrationSubmit = async (payload: { fullName: string; email: string; phone: string; notes: string }) => {
    if (!selectedEvent) return
    try {
      await eventsApi.rsvp(selectedEvent.id, 'GOING')
      queryClient.invalidateQueries({ queryKey: ['events'], exact: false })
    } catch {
      // demo mode / API unavailable — still confirm the RSVP locally
    }
    saveRegisteredEvent(selectedEvent.id)
    const newInvitation = saveInvitation({
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      dateTime: selectedEvent.date,
      venue: selectedEvent.isOnline ? 'Online Event' : (selectedEvent.location || 'To be announced'),
    })
    toast.success(`You're registered for ${selectedEvent.title}!`)
    setInvitation(newInvitation)
    setInvitationOpen(true)
  }

  useEffect(() => {
    if (selectedEvent && registrationOpen) return
  }, [selectedEvent, registrationOpen])

  return (
    <PortalBackground portal="events">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 px-4 md:px-6 py-8">
        {/* Hero */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b, #eab308)' }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')] opacity-20" />

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
                <Calendar className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-bold mb-4 border border-white/30 shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Upcoming Events
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-outfit font-black text-white tracking-tight mb-4 drop-shadow-lg"
                >
                  Community Events
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/95 text-lg max-w-2xl leading-relaxed font-medium"
                >
                  Discover and RSVP to local gatherings, workshops, and celebrations in your area.
                </motion.p>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              <Link href="/events/create">
                <GradientButton variant="orange" size="lg" className="group shadow-2xl">
                  <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                  Create Event
                </GradientButton>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-orange-400" />
          </div>
        ) : events.length === 0 ? (
          <motion.div variants={itemVariants} className="py-16 text-center text-gray-300 bg-white/5 rounded-3xl border border-dashed border-white/20 backdrop-blur-sm">
            <p className="text-lg">No upcoming events found.</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 30).map((event: Event) => (
              <motion.div key={event.id} variants={itemVariants}>
                <Link href={`/events/${event.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:border-orange-400/50 transition-all cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 h-full flex flex-col"
                  >
                    {/* Banner */}
                    <div className="h-48 relative overflow-hidden">
                      {event.bannerImage ? (
                        <ImageWithFallback src={event.bannerImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500">
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md text-orange-600 text-xs font-bold shadow-lg flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(event.date), 'MMM d, h:mm a')}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors line-clamp-2">
                        {event.title}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        <span className="line-clamp-1">{event.isOnline ? 'Online Event' : event.location}</span>
                      </div>

                      <p className="text-sm text-gray-300 line-clamp-2 mb-4 flex-1">
                        {event.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="flex items-center gap-2 text-sm text-amber-300 font-semibold">
                          <Users className="w-4 h-4" />
                          {event._count?.participants || 0} attending
                        </span>
                        <Button
                          size="sm"
                          onClick={(e) => handleRegister(e, event)}
                          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold shadow-lg"
                        >
                          <Ticket className="w-4 h-4 mr-1.5" />
                          {registeredEventIds.includes(event.id) ? 'View Invitation' : 'Register'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
      <EventRegistrationModal
        open={registrationOpen}
        onOpenChange={setRegistrationOpen}
        event={selectedEvent}
        onSubmit={handleRegistrationSubmit}
      />
      <InvitationCardModal
        open={invitationOpen}
        onOpenChange={setInvitationOpen}
        invitation={invitation}
      />
    </PortalBackground>
  )
}
