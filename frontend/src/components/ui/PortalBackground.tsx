'use client'

import { ReactNode, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type PortalType = 'communities' | 'jobs' | 'events' | 'news' | 'tourism' | 'education' | 'marketplace' | 'government' | 'healthcare' | 'notifications'

interface PortalBackgroundProps {
  portal: PortalType
  children: ReactNode
  className?: string
}

interface ParticleStyle {
  background: string
  left: string
  top: string
}

interface ParticleConfig extends ParticleStyle {
  randomX: number
  randomDelay: number
  randomDuration: number
}

const portalThemes = {
  communities: {
    gradient: 'from-purple-900/30 via-indigo-900/20 to-violet-900/30',
    meshColors: ['#a855f7', '#6366f1', '#4f46e5'],
    particles: true,
  },
  jobs: {
    gradient: 'from-blue-900/30 via-cyan-900/20 to-blue-800/30',
    meshColors: ['#3b82f6', '#06b6d4', '#2563eb'],
    particles: true,
  },
  events: {
    gradient: 'from-orange-900/30 via-amber-900/20 to-yellow-900/30',
    meshColors: ['#f97316', '#f59e0b', '#eab308'],
    particles: true,
  },
  news: {
    gradient: 'from-red-900/30 via-rose-900/20 to-crimson-900/30',
    meshColors: ['#ef4444', '#be123c', '#dc2626'],
    particles: false,
  },
  tourism: {
    gradient: 'from-emerald-900/30 via-green-900/20 to-teal-900/30',
    meshColors: ['#22c55e', '#10b981', '#14b8a6'],
    particles: true,
  },
  education: {
    gradient: 'from-teal-900/30 via-sky-900/20 to-cyan-900/30',
    meshColors: ['#14b8a6', '#0ea5e9', '#06b6d4'],
    particles: true,
  },
  marketplace: {
    gradient: 'from-cyan-900/30 via-blue-900/20 to-indigo-900/30',
    meshColors: ['#06b6d4', '#3b82f6', '#6366f1'],
    particles: true,
  },
  government: {
    gradient: 'from-indigo-900/40 via-blue-900/30 to-slate-900/40',
    meshColors: ['#6366f1', '#1e40af', '#334155'],
    particles: false,
  },
  healthcare: {
    gradient: 'from-green-900/30 via-emerald-900/20 to-teal-900/30',
    meshColors: ['#22c55e', '#10b981', '#14b8a6'],
    particles: true,
  },
  notifications: {
    gradient: 'from-slate-900/40 via-indigo-900/30 to-slate-900/40',
    meshColors: ['#6366f1', '#8b5cf6', '#0ea5e9'],
    particles: true,
  },
}

interface ParticleContainerProps {
  theme: (typeof portalThemes)[PortalType]
}

function ParticleContainer({ theme }: ParticleContainerProps) {
  // Generated client-side only (post-mount) so SSR markup (no particles)
  // matches the initial client render — Math.random() would otherwise
  // differ between server and client and trigger a hydration mismatch.
  const [particles, setParticles] = useState<ParticleConfig[]>([])

  useEffect(() => {
    // Math.random() must not run during the shared server/client render pass
    // (see comment above), so this deliberately defers to an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(
      [...Array(15)].map((_, i) => ({
        background: theme.meshColors[i % theme.meshColors.length],
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        randomX: Math.random() * 20 - 10,
        randomDelay: Math.random() * 5,
        randomDuration: 5 + Math.random() * 5,
      } as ParticleConfig))
    )
    // theme.meshColors is a stable reference from the portalThemes map keyed by portal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full opacity-20"
          style={{
            background: particle.background,
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, particle.randomX, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: particle.randomDuration,
            repeat: Infinity,
            delay: particle.randomDelay,
          }}
        />
      ))}
    </div>
  )
}

export function PortalBackground({ portal, children, className = '' }: PortalBackgroundProps) {
  const theme = portalThemes[portal]

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} animate-gradient`} />

        {/* Animated Mesh Gradient */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id={`grad1-${portal}`} cx="30%" cy="30%">
              <stop offset="0%" style={{ stopColor: theme.meshColors[0], stopOpacity: 0.4 }}>
                <animate attributeName="stop-opacity" values="0.4;0.6;0.4" dur="8s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" style={{ stopColor: theme.meshColors[0], stopOpacity: 0 }} />
            </radialGradient>
            <radialGradient id={`grad2-${portal}`} cx="70%" cy="60%">
              <stop offset="0%" style={{ stopColor: theme.meshColors[1], stopOpacity: 0.4 }}>
                <animate attributeName="stop-opacity" values="0.4;0.6;0.4" dur="10s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" style={{ stopColor: theme.meshColors[1], stopOpacity: 0 }} />
            </radialGradient>
            <radialGradient id={`grad3-${portal}`} cx="50%" cy="80%">
              <stop offset="0%" style={{ stopColor: theme.meshColors[2], stopOpacity: 0.4 }}>
                <animate attributeName="stop-opacity" values="0.4;0.6;0.4" dur="12s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" style={{ stopColor: theme.meshColors[2], stopOpacity: 0 }} />
            </radialGradient>
          </defs>
          <circle cx="30%" cy="30%" r="40%" fill={`url(#grad1-${portal})`}>
            <animate attributeName="cx" values="30%;35%;30%" dur="20s" repeatCount="indefinite" />
            <animate attributeName="cy" values="30%;25%;30%" dur="15s" repeatCount="indefinite" />
          </circle>
          <circle cx="70%" cy="60%" r="35%" fill={`url(#grad2-${portal})`}>
            <animate attributeName="cx" values="70%;65%;70%" dur="18s" repeatCount="indefinite" />
            <animate attributeName="cy" values="60%;65%;60%" dur="22s" repeatCount="indefinite" />
          </circle>
          <circle cx="50%" cy="80%" r="30%" fill={`url(#grad3-${portal})`}>
            <animate attributeName="cx" values="50%;55%;50%" dur="16s" repeatCount="indefinite" />
            <animate attributeName="cy" values="80%;75%;80%" dur="20s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Grain Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
      </div>

      {/* Floating Particles (for select portals) */}
      {theme.particles && <ParticleContainer theme={theme} />}

      {/* Content */}
      <div className="relative z-0">{children}</div>
    </div>
  )
}
