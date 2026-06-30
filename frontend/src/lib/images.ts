/**
 * Curated image helper — guarantees every card, banner and avatar has a
 * relevant, high-quality image instead of an empty placeholder.
 *
 * We keep small pools of hand-picked Unsplash photos per category and pick
 * one deterministically from any stable id (so the same item always shows
 * the same image, and there are no layout-shifting random swaps).
 */

const POOLS: Record<string, string[]> = {
  communities: [
    'photo-1529156069898-49953e39b3ac', 'photo-1511632765486-a01980e01a18',
    'photo-1543269865-cbf427effbad', 'photo-1517457373958-b7bdd4587205',
  ],
  jobs: [
    'photo-1497215728101-856f4ea42174', 'photo-1521737604893-d14cc237f11d',
    'photo-1486406146926-c627a92ad1ab', 'photo-1531973576160-7125cd663d86',
  ],
  events: [
    'photo-1492684223066-81342ee5ff30', 'photo-1511795409834-ef04bbd61622',
    'photo-1505373877841-8d25f7d46678', 'photo-1530103862676-de8c9debad1d',
  ],
  tourism: [
    'photo-1506905925346-21bda4d32df4', 'photo-1469854523086-cc02fe5d8800',
    'photo-1501785888041-af3ef285b470', 'photo-1507525428034-b723cf961d3e',
  ],
  news: [
    'photo-1504711434969-e33886168f5c', 'photo-1495020689067-958852a7765e',
    'photo-1557992260-ec58e38d363c', 'photo-1585829365295-ab7cd400c167',
  ],
  education: [
    'photo-1523050854058-8df90110c9f1', 'photo-1541339907198-e08756dedf3f',
    'photo-1509062522246-3755977927d7', 'photo-1517486808906-6ca8b3f04846',
  ],
  marketplace: [
    'photo-1556742049-0cfed4f6a45d', 'photo-1607082348824-0a96f2a4b9da',
    'photo-1472851294608-062f824d29cc', 'photo-1513708927688-890fe41c2e4a',
  ],
  government: [
    'photo-1529107386315-e1a2ed48a620', 'photo-1486406146926-c627a92ad1ab',
    'photo-1555848962-6e79363ec58f', 'photo-1564574685150-44f3f4f0f06a',
  ],
  healthcare: [
    'photo-1538108149393-fbbd81895907', 'photo-1576091160550-2173dba999ef',
    'photo-1505751172876-fa1923c5c528', 'photo-1551190822-a9333d879b1f',
  ],
  agriculture: [
    'photo-1500651230702-0e2d8a49d4ad', 'photo-1574943320219-553eb213f72d',
    'photo-1592982537447-7440770cbfc9', 'photo-1625246333195-78d9c38ad449',
  ],
  business: [
    'photo-1486406146926-c627a92ad1ab', 'photo-1497366216548-37526070297c',
    'photo-1556761175-5973dc0f32e7', 'photo-1431540015161-0bf868a2d407',
  ],
  avatar: [
    'photo-1500648767791-00dcc994a43e', 'photo-1494790108377-be9c29b29330',
    'photo-1507003211169-0a1dd7228f2d', 'photo-1438761681033-6461ffad8d80',
  ],
}

const GENERIC = 'photo-1517457373614-b7152f800fd1'
const UNSPLASH = 'https://images.unsplash.com'

/**
 * Lightweight validation that a string looks like a usable image source.
 * Accepts absolute http(s) URLs, site-relative paths and inline data URIs.
 * Used to guard user-supplied image URLs before we persist or render them so
 * an invalid value cleanly falls back to a placeholder instead of breaking.
 */
export function isValidImageUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('/') || trimmed.startsWith('data:image/')) return true
  try {
    const { protocol } = new URL(trimmed)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

/** Stable hash so the same id always maps to the same photo in a pool. */
function hash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(h)
}

interface ImgOpts {
  w?: number
  h?: number
}

/**
 * Returns a relevant image for a category, deterministic on `seed`.
 * Use the item's id/slug as the seed so images stay stable across renders.
 */
export function categoryImage(category: string, seed = '', opts: ImgOpts = {}): string {
  const pool = POOLS[category] ?? POOLS.communities ?? [GENERIC]
  const photo = pool[hash(seed || category) % pool.length] ?? GENERIC
  const { w = 800, h = 500 } = opts
  return `${UNSPLASH}/${photo}?w=${w}&h=${h}&fit=crop&auto=format&q=70`
}

/** Avatar fallback that is deterministic on a name/id. */
export function avatarImage(seed = '', size = 200): string {
  const pool = POOLS.avatar!
  const photo = pool[hash(seed) % pool.length]
  return `${UNSPLASH}/${photo}?w=${size}&h=${size}&fit=crop&crop=faces&auto=format&q=70`
}

/**
 * Best image for an entity: prefer a real image field, otherwise fall back
 * to a curated category image keyed on the entity id.
 */
export function resolveImage(
  category: string,
  entity: { id?: string; slug?: string; image?: string; bannerImage?: string; coverImage?: string; thumbnail?: string } | null | undefined,
  opts?: ImgOpts,
): string {
  const real = entity?.image || entity?.bannerImage || entity?.coverImage || entity?.thumbnail
  if (real) return real
  return categoryImage(category, entity?.id || entity?.slug || '', opts)
}
