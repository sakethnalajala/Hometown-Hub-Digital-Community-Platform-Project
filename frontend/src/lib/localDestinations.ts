export interface LocalDestination {
  id: string
  name: string
  category: string
  type: string
  location: string
  description: string
  bestTime: string
  bestSeason: string
  rating: number
  image: string
  images: string[]
  entryFee: string
  openingTime: string
  travelTips: string
  contactInfo: string
  nearbyAttractions: string[]
  nearbyHotels: string[]
  mapUrl: string
  isLocal: true
  createdAt: string
}

const STORAGE_KEY = 'hometown-hub-local-destinations'

export function getLocalDestinations(): LocalDestination[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveAll(destinations: LocalDestination[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(destinations))
}

export function addLocalDestination(data: Omit<LocalDestination, 'id' | 'images' | 'isLocal' | 'createdAt' | 'entryFee' | 'openingTime' | 'travelTips' | 'contactInfo' | 'nearbyAttractions' | 'nearbyHotels' | 'mapUrl'>): LocalDestination {
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const destination: LocalDestination = {
    ...data,
    id,
    images: [data.image],
    entryFee: 'Free',
    openingTime: 'Open year-round',
    travelTips: 'Check local conditions before visiting.',
    contactInfo: 'Incredible India Tourism Helpline: 1800-11-1363 (toll-free, 24x7)',
    nearbyAttractions: [],
    nearbyHotels: [],
    mapUrl: `https://maps.google.com/?q=${encodeURIComponent(`${data.name} ${data.location}`)}`,
    isLocal: true,
    createdAt: new Date().toISOString(),
  }
  const current = getLocalDestinations()
  saveAll([destination, ...current])
  return destination
}

export function updateLocalDestination(id: string, updates: Partial<LocalDestination>): LocalDestination | null {
  const current = getLocalDestinations()
  const index = current.findIndex((d) => d.id === id)
  if (index === -1) return null
  current[index] = { ...current[index], ...updates, images: updates.image ? [updates.image] : current[index].images }
  saveAll(current)
  return current[index]
}

export function deleteLocalDestination(id: string) {
  saveAll(getLocalDestinations().filter((d) => d.id !== id))
}

export function getLocalDestinationById(id: string): LocalDestination | null {
  return getLocalDestinations().find((d) => d.id === id) || null
}
