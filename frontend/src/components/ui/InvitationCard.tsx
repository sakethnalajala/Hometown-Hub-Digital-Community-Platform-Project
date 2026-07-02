'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Printer, Calendar, MapPin, Ticket, Loader2, X, Sparkles } from 'lucide-react'
import type { EventInvitation } from '@/lib/invitations'

interface InvitationCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invitation: EventInvitation | null
}

function formatDate(value?: string) {
  if (!value) return 'To be announced'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}

function formatTime(value?: string) {
  if (!value) return 'To be announced'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric' }).format(date)
}

function qrUrlFor(data: string, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(data)}`
}

export function InvitationCardModal({ open, onOpenChange, invitation }: InvitationCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  if (!invitation) return null

  const tickets = invitation.tickets?.length ? invitation.tickets : [{ ticketNumber: invitation.ticketNumber, seatNumber: 'A1' }]
  const invitationQr = qrUrlFor(`${invitation.eventTitle} | ${invitation.fullName} | ${invitation.tickets?.length || 1} ticket(s)`, 180)

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
      link.download = `${invitation.eventTitle.replace(/\s+/g, '-').toLowerCase()}-invitation.png`
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

        <div className="overflow-y-auto max-h-[92vh] pt-1 print:hidden">
          {/* Decorative invitation card — this is what "Download Invitation" exports */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl"
            style={{ background: 'linear-gradient(150deg, #1e1147 0%, #4c1d95 35%, #db2777 75%, #f97316 100%)' }}
          >
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

            {invitation.eventImage && (
              <div className="relative h-32 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={invitation.eventImage} alt="" crossOrigin="anonymous" className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e1147] to-transparent" />
              </div>
            )}

            <div className="relative z-10 p-8 pt-6 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.15 }}
                className="w-14 h-14 mx-auto rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center mb-3 shadow-lg"
              >
                <Sparkles className="w-7 h-7 text-amber-200" />
              </motion.div>

              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-200">Welcome To</p>
              <h2 className="text-3xl font-outfit font-black mt-1 mb-5 drop-shadow-lg leading-tight">{invitation.eventTitle}</h2>

              <p className="text-sm text-white/90 leading-relaxed max-w-sm mx-auto">
                Dear <span className="font-semibold">{invitation.fullName}</span>,<br />
                We are delighted to invite you to our event.
              </p>

              <div className="grid grid-cols-2 gap-4 my-6 text-left rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5">
                <div>
                  <p className="text-white/60 text-[10px] uppercase tracking-wide mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Venue</p>
                  <p className="font-semibold text-sm">{invitation.venue}</p>
                </div>
                <div>
                  <p className="text-white/60 text-[10px] uppercase tracking-wide mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</p>
                  <p className="font-semibold text-sm">{formatDate(invitation.dateTime)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-white/60 text-[10px] uppercase tracking-wide mb-1">Time</p>
                  <p className="font-semibold text-sm">{formatTime(invitation.dateTime)}</p>
                </div>
              </div>

              <p className="text-xs text-white/80 mb-5">
                Thank you for registering. Please carry your ticket and QR Code.
                {tickets.length > 1 && <><br />Seats: {tickets.map((t) => t.seatNumber).join(', ')}</>}
              </p>

              <div className="flex flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={invitationQr}
                  alt="Invitation QR code"
                  crossOrigin="anonymous"
                  width={120}
                  height={120}
                  className="rounded-xl bg-white p-2 shadow-lg"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-white/25 text-[11px] text-white/60">
                <p className="font-semibold text-white/80">{invitation.organizer}</p>
                <p>Hometown Hub &middot; Community Events &middot; support@hometownhub.com</p>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-3 mt-4">
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
              <Printer className="w-4 h-4 mr-2" /> Print Ticket{tickets.length > 1 ? `s (${tickets.length})` : ''}
            </Button>
          </div>
        </div>

        {/* Print-only ticket pages — one ticket per printed page, hidden on screen */}
        <div id="ticket-print-area" className="hidden print:block">
          {tickets.map((ticket, i) => (
            <div key={ticket.ticketNumber} className="ticket-page">
              <div className="ticket-card">
                <div className="ticket-card-header">
                  <div className="ticket-card-brand">
                    <Ticket className="w-5 h-5" />
                    <span>Hometown Hub</span>
                  </div>
                  <span className="ticket-card-badge">Ticket {i + 1} of {tickets.length}</span>
                </div>

                <h1 className="ticket-card-title">{invitation.eventTitle}</h1>

                <div className="ticket-card-grid">
                  <div>
                    <p className="ticket-card-label">Guest Name</p>
                    <p className="ticket-card-value">{invitation.fullName}</p>
                  </div>
                  <div>
                    <p className="ticket-card-label">Ticket Number</p>
                    <p className="ticket-card-value">{ticket.ticketNumber}</p>
                  </div>
                  <div>
                    <p className="ticket-card-label">Seat Number</p>
                    <p className="ticket-card-value">{ticket.seatNumber}</p>
                  </div>
                  <div>
                    <p className="ticket-card-label">Event Date</p>
                    <p className="ticket-card-value">{formatDate(invitation.dateTime)}</p>
                  </div>
                  <div>
                    <p className="ticket-card-label">Event Time</p>
                    <p className="ticket-card-value">{formatTime(invitation.dateTime)}</p>
                  </div>
                  <div>
                    <p className="ticket-card-label">Venue</p>
                    <p className="ticket-card-value">{invitation.venue}</p>
                  </div>
                </div>

                <div className="ticket-card-qr-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrlFor(`${invitation.eventTitle} | ${ticket.ticketNumber} | ${ticket.seatNumber} | ${invitation.fullName}`, 240)}
                    alt={`QR code for ticket ${ticket.ticketNumber}`}
                    width={180}
                    height={180}
                  />
                </div>

                <div className="ticket-card-footer">
                  <div>
                    <p className="ticket-card-label">Organizer</p>
                    <p className="ticket-card-value">{invitation.organizer}</p>
                  </div>
                  <div className="ticket-card-terms">
                    <p className="ticket-card-label">Terms &amp; Conditions</p>
                    <p>This ticket is valid for one entry only and is non-transferable. Please carry a valid photo ID along with this ticket and QR code. Entry is subject to venue capacity and organizer discretion. Hometown Hub is not liable for loss, theft, or damage of this ticket.</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
