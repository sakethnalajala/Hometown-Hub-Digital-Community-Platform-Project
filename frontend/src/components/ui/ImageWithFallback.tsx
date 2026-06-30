'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ImageOff } from 'lucide-react'

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=800&h=400&fit=crop'

export function ImageWithFallback({
  src,
  alt = '',
  className,
  fallbackSrc = DEFAULT_FALLBACK,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={cn('relative overflow-hidden bg-muted/30', className?.includes('w-') ? '' : 'w-full')}>
      {!loaded && !error && (
        <div className={cn('absolute inset-0 skeleton', className)} />
      )}
      {error ? (
        <div className={cn('flex items-center justify-center bg-muted/50 text-muted-foreground', className)}>
          <ImageOff className="h-8 w-8 opacity-40" />
        </div>
      ) : (
        <img
          src={src || fallbackSrc}
          alt={alt}
          className={cn('object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0', className)}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true) }}
          {...props}
        />
      )}
    </div>
  )
}
