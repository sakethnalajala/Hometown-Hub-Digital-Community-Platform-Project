import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { AuthGuard } from '@/components/providers/AuthGuard'
import { FloatingParticles } from '@/components/ui/FloatingParticles'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <FloatingParticles />
      <div className="app-canvas flex min-h-screen bg-background relative z-10">
        <Sidebar />
        <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
