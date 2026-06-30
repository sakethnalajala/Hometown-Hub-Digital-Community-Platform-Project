'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Omit the native DOM drag/animation handlers that clash with framer-motion's
// own motion-prop signatures on motion.button.
type MotionConflictingProps =
  | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop'
  | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'

interface GradientButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, MotionConflictingProps> {
  variant?: 'purple' | 'blue' | 'orange' | 'red' | 'green' | 'teal' | 'cyan' | 'indigo'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const gradients = {
  purple: 'from-purple-600 via-purple-500 to-indigo-600',
  blue: 'from-blue-600 via-cyan-500 to-blue-700',
  orange: 'from-orange-600 via-amber-500 to-yellow-600',
  red: 'from-red-600 via-rose-500 to-crimson-700',
  green: 'from-emerald-600 via-green-500 to-teal-600',
  teal: 'from-teal-600 via-cyan-500 to-sky-600',
  cyan: 'from-cyan-600 via-blue-500 to-indigo-600',
  indigo: 'from-indigo-600 via-blue-600 to-slate-700',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant = 'purple', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={cn(
          'relative overflow-hidden rounded-full font-bold text-white shadow-2xl transition-all duration-300',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50',
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Gradient Background */}
        <div className={cn('absolute inset-0 bg-gradient-to-r', gradients[variant])} />

        {/* Animated Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ['-200%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {children}
        </span>

        {/* Ripple Effect on Click */}
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ scale: 0, opacity: 1 }}
          whileTap={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </motion.button>
    )
  }
)

GradientButton.displayName = 'GradientButton'
