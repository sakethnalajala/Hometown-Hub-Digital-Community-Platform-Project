'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, MapPin, Mail, Phone, User, Sparkles } from 'lucide-react'

interface EventRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: any
  onSubmit: (payload: any) => void
}

export function EventRegistrationModal({ open, onOpenChange, event, onSubmit }: EventRegistrationModalProps) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  })

  const isReady = useMemo(
    () => Boolean(form.fullName.trim() && form.email.trim() && form.phone.trim()),
    [form]
  )

  const handleSubmit = () => {
    onSubmit({
      ...form,
      eventId: event?.id,
      eventTitle: event?.title,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-400" /> Register for {event?.title || 'Event'}
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Fill in your details to RSVP. We'll keep your registration saved locally and send a confirmation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {event && (
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
              <div className="flex items-center gap-3 text-sm text-orange-100">
                <MapPin className="w-4 h-4" /> {event.location || 'Online event'}
              </div>
              <div className="mt-2 text-white">
                <p className="font-semibold">{formatDate(event.date)}</p>
                <p className="text-sm text-slate-300">{event.description}</p>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="pl-12 bg-white/5 border-white/10 text-white"
                  placeholder="Your full name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-12 bg-white/5 border-white/10 text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="pl-12 bg-white/5 border-white/10 text-white"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Additional Notes</Label>
              <Textarea
                rows={4}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Any special requirements or questions"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isReady} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <Sparkles className="mr-2 h-4 w-4" /> Confirm RSVP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function formatDate(value: string | Date | undefined) {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date)
}
