import { Home } from 'lucide-react'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0B1120] text-white">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0">
        <AnimatedBackground />
      </div>

      <div className="z-10 w-full max-w-md p-6">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/15 text-purple-300 shadow-[0_0_30px_rgba(99,102,241,0.18)]">
              <Home className="h-7 w-7 animate-pulse-glow" />
            </div>
            <span className="font-outfit font-extrabold text-3xl tracking-tight text-white">
              Hometown Hub
            </span>
          </Link>
        </div>

        <div className="rounded-[32px] bg-[#111827] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.45)] p-8 animate-fade-in delay-100">
          {children}
        </div>
      </div>
    </div>
  )
}
