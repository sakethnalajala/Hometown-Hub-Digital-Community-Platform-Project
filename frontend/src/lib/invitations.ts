export interface EventInvitation {
  ticketNumber: string
  eventId?: string
  eventTitle: string
  fullName: string
  email: string
  phone: string
  dateTime?: string
  venue: string
  createdAt: string
}

const STORAGE_KEY = 'hometown-hub-event-invitations'

function generateTicketNumber(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `HH-${new Date().getFullYear()}-${rand}`
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

export function saveInvitation(data: Omit<EventInvitation, 'ticketNumber' | 'createdAt'>): EventInvitation {
  const invitation: EventInvitation = {
    ...data,
    ticketNumber: generateTicketNumber(),
    createdAt: new Date().toISOString(),
  }
  if (typeof window !== 'undefined') {
    const current = getInvitations().filter((inv) => inv.eventId !== data.eventId || !data.eventId)
    const updated = [invitation, ...current]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }
  return invitation
}
