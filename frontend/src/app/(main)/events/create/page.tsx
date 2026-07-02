'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, ArrowLeft, CalendarPlus } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CreateEventPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    date: '',
    time: '18:00',
    maxParticipants: '100',
    isOnline: false,
  })

  const mutation = useMutation({
    mutationFn: () => {
      // The backend expects ISO string for date
      const dateTimeString = form.date && form.time ? `${form.date}T${form.time}:00` : new Date().toISOString();
      return eventsApi.create({
        title: form.title,
        description: form.description,
        location: form.isOnline ? 'Online' : form.location,
        address: form.address,
        date: new Date(dateTimeString).toISOString(),
        isOnline: form.isOnline,
        maxParticipants: parseInt(form.maxParticipants) || 100,
      })
    },
    onSuccess: (res) => {
      toast.success('Event created!')
      if (res.data) router.push(`/events/${res.data.id}`)
    },
    onError: (err: unknown) => {
      const error = err instanceof Error ? err : new Error('Failed to create event')
      toast.error(error.message)
    },
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/events" className="inline-flex items-center text-sm text-pink-400 hover:text-pink-300 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Events
      </Link>
      
      <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/10 border border-pink-500/20 p-6 rounded-3xl">
        <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
          <CalendarPlus className="w-6 h-6 text-pink-400" />
        </div>
        <h1 className="text-3xl font-outfit font-bold text-white mb-2">Create Event</h1>
        <p className="text-pink-200/70">Organize a gathering for your community. Fill out the details below.</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Event Title <span className="text-red-500">*</span></label>
          <Input className="bg-white/5 border-white/10" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Community Meetup" />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Description <span className="text-red-500">*</span></label>
          <Textarea className="bg-white/5 border-white/10" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} placeholder="What is this event about?" />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <p className="font-medium text-sm text-white">Online Event</p>
            <p className="text-xs text-muted-foreground">Event will be held virtually</p>
          </div>
          <Switch checked={form.isOnline} onCheckedChange={v => setForm({ ...form, isOnline: v })} />
        </div>

        {!form.isOnline && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Venue Name <span className="text-red-500">*</span></label>
              <Input className="bg-white/5 border-white/10" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Central Park" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Full Address</label>
              <Input className="bg-white/5 border-white/10" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City" />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Date <span className="text-red-500">*</span></label>
            <Input className="bg-white/5 border-white/10" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Time <span className="text-red-500">*</span></label>
            <Input className="bg-white/5 border-white/10" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Max Participants</label>
          <Input className="bg-white/5 border-white/10" type="number" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: e.target.value })} min="1" />
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-white/10">
          <Button variant="ghost" onClick={() => router.back()} className="hover:bg-white/5 text-muted-foreground hover:text-white">Cancel</Button>
          <Button className="bg-pink-600 hover:bg-pink-500 text-white" disabled={mutation.isPending || !form.title || !form.description || !form.date || (!form.isOnline && !form.location)} onClick={() => mutation.mutate()}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Publish Event
          </Button>
        </div>
      </div>
    </div>
  )
}
