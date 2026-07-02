export interface TicketEntry {
  ticketNumber: string
  seatNumber: string
}

export interface EventInvitation {
  ticketNumber: string
  eventId?: string
  eventTitle: string
  fullName: string
  email: string
  phone: string
  dateTime?: string
  venue: string
  quantity: number
  tickets: TicketEntry[]
  organizer: string
  eventImage?: string
  createdAt: string
}

const STORAGE_KEY = 'hometown-hub-event-invitations'
const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F']

function generateTicketNumber(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `HH-${new Date().getFullYear()}-${rand}`
}

function generateSeatNumber(index: number): string {
  const row = SEAT_ROWS[Math.floor(index / 10) % SEAT_ROWS.length]
  const seat = (index % 10) + 1
  return `${row}${seat}`
}

export function getInvitations(): EventInvitation[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function getInvitationByEventId(eventId?: string): EventInvitation | null {
  if (!eventId) return null
  return getInvitations().find((inv) => inv.eventId === eventId) || null
}

export function saveInvitation(
  data: Omit<EventInvitation, 'ticketNumber' | 'createdAt' | 'tickets'> & { quantity?: number }
): EventInvitation {
  const quantity = Math.max(1, Math.min(6, data.quantity || 1))
  const tickets: TicketEntry[] = Array.from({ length: quantity }, (_, i) => ({
    ticketNumber: generateTicketNumber(),
    seatNumber: generateSeatNumber(i),
  }))
  const invitation: EventInvitation = {
    ...data,
    quantity,
    tickets,
    ticketNumber: tickets[0].ticketNumber,
    createdAt: new Date().toISOString(),
  }
  if (typeof window !== 'undefined') {
    const current = getInvitations().filter((inv) => inv.eventId !== data.eventId || !data.eventId)
    const updated = [invitation, ...current]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }
  return invitation
}
