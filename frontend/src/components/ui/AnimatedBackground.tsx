'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function AnimatedBackground() {
  // Generated client-side only (post-mount) so the server-rendered markup
  // (no particles) matches the initial client render, avoiding a hydration
  // mismatch — Math.random() would otherwise differ between SSR and client.
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    duration: number
    delay: number
  }>>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
      }))
    )
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden bg-[hsl(var(--bg-base))]">
      {/* Animated Gradient Background */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(circle at center, #1a0b2e 0%, #050a1f 40%, #000000 100%)',
        }}
      />
      
      {/* Dynamic light orbs */}
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px]"
        animate={{
          x: ['0%', '20%', '0%'],
          y: ['0%', '30%', '0%'],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div 
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]"
        animate={{
          x: ['0%', '-20%', '0%'],
          y: ['0%', '-30%', '0%'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div 
        className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-600/15 blur-[90px]"
        animate={{
          x: ['0%', '-40%', '0%'],
          y: ['0%', '40%', '0%'],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: 0.1,
            boxShadow: '0 0 10px 2px rgba(255,255,255,0.3)',
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}
