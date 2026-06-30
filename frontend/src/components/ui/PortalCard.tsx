'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ReactNode } from 'react'
import { getTheme, type PortalTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

/**
 * A themed, hover-animated card. Lifts and reveals a colored glow + gradient
 * border on hover. Renders as a Link when `href` is provided.
 */
interface PortalCardProps {
  theme?: string | PortalTheme
  href?: string
  children: ReactNode
  className?: string
  /** Disable the lift animation (e.g. inside already-animated lists). */
  flat?: boolean
}

export function PortalCard({ theme, href, children, className, flat }: PortalCardProps) {
  const t = theme ? (typeof theme === 'string' ? getTheme(theme) : theme) : null

  const content = (
    <motion.div
      whileHover={flat ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-colors duration-300 hover:border-white/20',
        className,
      )}
    >
      {/* hover glow */}
      {t && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 0 1px ${t.accent}55, 0 18px 40px -16px ${t.glow}` }}
        />
      )}
      {children}
    </motion.div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }
  return content
}

/**
 * Portal navigation tile used on the dashboard "Explore Portals" grid.
 * Icon-led, themed, with a sliding sheen on hover.
 */
export function PortalTile({ theme }: { theme: PortalTheme }) {
  const Icon = theme.icon
  return (
    <Link href={theme.href} className="block">
      <motion.div
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl"
        style={{ boxShadow: `0 10px 30px -18px ${theme.glow}` }}
      >
        {/* themed wash on hover */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-20',
          theme.gradient,
        )} />
        {/* sheen */}
        <div className="absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-white/10 opacity-0 transition-all duration-500 group-hover:left-[120%] group-hover:opacity-100" />

        <div className="relative z-10">
          <div className={cn(
            'mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-110',
            theme.gradient,
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-outfit text-base font-bold text-white">{theme.label}</h3>
          <p className="mt-0.5 text-xs text-white/60">{theme.description}</p>
        </div>
      </motion.div>
    </Link>
  )
}
