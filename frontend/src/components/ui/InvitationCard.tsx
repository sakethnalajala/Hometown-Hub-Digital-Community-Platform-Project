'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Printer, CheckCircle2, Calendar, MapPin, Mail, Phone, Ticket, Loader2, X } from 'lucide-react'
import type { EventInvitation } from '@/lib/invitations'

interface InvitationCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invitation: EventInvitation | null
}

function formatDateTime(value?: string) {
  if (!value) return 'To be announced'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date)
}

export function InvitationCardModal({ open, onOpenChange, invitation }: InvitationCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  if (!invitation) return null

  const qrData = encodeURIComponent(
    `${invitation.eventTitle} | ${invitation.ticketNumber} | ${invitation.fullName}`
  )
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${qrData}`

  const handleDownload = async () => {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `${invitation.ticketNumber}-invitation.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      // If the export fails (e.g. offline QR fetch), the user can still print instead
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg max-h-[92vh] bg-transparent border-none shadow-none p-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Event Invitation</DialogTitle>
        </DialogHeader>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close invitation"
          className="absolute -top-3 -right-3 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg ring-2 ring-white/50 transition-transform hover:scale-110 hover:bg-gray-100 print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto max-h-[92vh] pt-1">
        <div id="invitation-print-area">
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl"
            style={{ background: 'linear-gradient(150deg, #1e1147 0%, #4c1d95 35%, #db2777 75%, #f97316 100%)' }}
          >
            {/* Decorative animated glow orbs */}
            <motion.div
              className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-purple-400/30 blur-3xl"
              animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full bg-orange-400/30 blur-3xl"
              animate={{ x: [0, -20, 0], y: [0, -15, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 p-8 text-white">
              {/* Success badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.15 }}
                className="flex flex-col items-center text-center mb-6"
              >
                <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center mb-3 shadow-lg">
                  <CheckCircle2 className="w-9 h-9 text-emerald-300" />
                </div>
                <p className="text-sm font-bold tracking-widest uppercase text-emerald-200">Registration Successful</p>
                <h2 className="text-2xl font-outfit font-black mt-1 drop-shadow-lg">{invitation.eventTitle}</h2>
              </motion.div>

              {/* Ticket body */}
              <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Guest Name</p>
                    <p className="font-semibold">{invitation.fullName}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wide mb-1 flex items-center gap-1"><Ticket className="w-3 h-3" /> Ticket No.</p>
                    <p className="font-semibold font-mono">{invitation.ticketNumber}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wide mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                    <p className="font-semibold break-all">{invitation.email}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wide mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                    <p className="font-semibold">{invitation.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/60 text-xs uppercase tracking-wide mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date &amp; Time</p>
                    <p className="font-semibold">{formatDateTime(invitation.dateTime)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/60 text-xs uppercase tracking-wide mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Venue</p>
                    <p className="font-semibold">{invitation.venue}</p>
                  </div>
                </div>

                <div className="border-t border-dashed border-white/25 pt-4 flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl}
                    alt="Invitation QR code"
                    crossOrigin="anonymous"
                    width={140}
                    height={140}
                    className="rounded-xl bg-white p-2 shadow-lg"
                  />
                  <p className="text-[11px] text-white/60 tracking-wide">Show this QR code at check-in</p>
                </div>
              </div>

              <p className="text-center text-[11px] text-white/50 mt-5">Hometown Hub &middot; Community Events</p>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-3 mt-4 print:hidden">
          <Button
            onClick={handleDownload}
            disabled={exporting}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold"
          >
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Download Invitation
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold"
          >
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
