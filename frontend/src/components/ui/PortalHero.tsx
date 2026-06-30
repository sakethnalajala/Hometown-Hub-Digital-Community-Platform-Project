'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { getTheme, type PortalTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

export interface HeroStat {
  label: string
  value: ReactNode
  icon?: ReactNode
}

interface PortalHeroProps {
  /** Portal key (e.g. "events") or a full theme object. */
  theme: string | PortalTheme
  title: ReactNode
  subtitle?: ReactNode
  eyebrow?: ReactNode
  /** Optional background photo layered under the gradient. */
  image?: string
  stats?: HeroStat[]
  actions?: ReactNode
  className?: string
  /** Compact variant for sub-pages. */
  size?: 'lg' | 'md'
}

/**
 * Reusable premium hero banner. Renders a themed gradient with animated glow
 * blobs, an optional background image, a headline, stats and CTA actions.
 * Every portal uses this so heroes share one language but keep unique colors.
 */
export function PortalHero({
  theme,
  title,
  subtitle,
  eyebrow,
  image,
  stats,
  actions,
  className,
  size = 'lg',
}: PortalHeroProps) {
  const t = typeof theme === 'string' ? getTheme(theme) : theme
  const Icon = t.icon

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl',
        size === 'lg' ? 'p-8 md:p-10' : 'p-6',
        className,
      )}
      style={{ boxShadow: `0 24px 60px -20px ${t.glow}` }}
    >
      {/* Background image */}
      {image && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/45" />
        </div>
      )}

      {/* Themed gradient wash */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-90', t.gradient)}
        style={image ? { opacity: 0.7, mixBlendMode: 'multiply' } : undefined} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Animated glow blobs */}
      <motion.div
        className="pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full blur-3xl"
        style={{ background: t.accent, opacity: 0.35 }}
        animate={{ x: [0, 24, 0], y: [0, 18, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/15 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, -16, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-1 ring-white/25">
              <Icon className="h-7 w-7 text-white" />
            </div>
            {eyebrow && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/70">
                {eyebrow}
              </p>
            )}
            <h1 className="font-outfit text-3xl font-bold leading-tight text-white md:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-xl text-base text-white/80">{subtitle}</p>
            )}
            {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
          </div>

          {stats && stats.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="min-w-[92px] rounded-2xl bg-white/15 p-4 text-center backdrop-blur-md ring-1 ring-white/20"
                >
                  <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-white">
                    {s.icon}
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-wider text-white/70">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  )
}
