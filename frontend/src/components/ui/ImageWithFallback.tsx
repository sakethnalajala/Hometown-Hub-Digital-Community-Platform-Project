'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ImageOff } from 'lucide-react'

interface ImageWithFallbackProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> {
  src?: string | null
  fallbackSrc?: string
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop'

export function ImageWithFallback({
  src,
  alt = '',
  className,
  fallbackSrc = DEFAULT_FALLBACK,
  ...props
}: ImageWithFallbackProps) {
  // Tracks whether we've already fallen back, so a broken *fallback* image
  // shows the ImageOff placeholder instead of retrying forever.
  const [usedFallback, setUsedFallback] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const activeSrc = (usedFallback ? fallbackSrc : (src || fallbackSrc)) as string

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
        <Image
          key={activeSrc}
          src={activeSrc}
          alt={alt}
          width={1200}
          height={800}
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn('object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0', className)}
          onLoad={() => setLoaded(true)}
          onError={() => {
            // First failure: retry once with the fallback image. Second
            // failure (fallback itself broken): give up and show the icon.
            if (!usedFallback && activeSrc !== fallbackSrc) {
              setUsedFallback(true)
            } else {
              setError(true)
              setLoaded(true)
            }
          }}
          {...props}
        />
      )}
    </div>
  )
}
