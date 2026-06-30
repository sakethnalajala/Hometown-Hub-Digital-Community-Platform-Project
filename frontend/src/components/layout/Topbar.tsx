'use client'

import { useUIStore } from '@/store/uiStore'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Topbar() {
  const { toggleSidebar } = useUIStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border/50 bg-background/80 backdrop-blur-md px-4 md:hidden">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
        <Menu className="h-5 w-5" />
      </Button>
      <span className="font-outfit font-bold text-lg tracking-tight">Hometown Hub</span>
    </header>
  )
}
