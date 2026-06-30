import { Home } from 'lucide-react'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black text-white">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0">
        <AnimatedBackground />
      </div>

      <div className="z-10 w-full max-w-md p-6">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-glow">
              <Home className="h-7 w-7 animate-pulse-glow" />
            </div>
            <span className="font-outfit font-extrabold text-3xl tracking-tight gradient-text">
              Hometown Hub
            </span>
          </Link>
        </div>

        <div className="glass-card p-8 animate-fade-in delay-100">
          {children}
        </div>
      </div>
    </div>
  )
}
