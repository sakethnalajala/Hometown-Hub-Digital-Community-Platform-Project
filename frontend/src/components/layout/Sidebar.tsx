'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, Users, Calendar, Newspaper, ShoppingBag, Briefcase, 
  Landmark, Map, GraduationCap, HeartPulse, Bell, 
  User as UserIcon, X, LogOut, Settings, LayoutDashboard 
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  const navItems = [
    { name: 'Feed', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Communities', href: '/communities', icon: Users },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Local News', href: '/news', icon: Newspaper },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Gov Services', href: '/government', icon: Landmark },
    { name: 'Tourism', href: '/tourism', icon: Map },
    { name: 'Education', href: '/education', icon: GraduationCap },
    { name: 'Healthcare', href: '/healthcare', icon: HeartPulse },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Admin', href: '/admin', icon: Settings })
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-border/50">
            <Link href="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Home className="h-5 w-5" />
              </div>
              <span className="font-outfit font-bold text-xl tracking-tight">Hometown Hub</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              
              // Define module-specific colors
              let colorClass = "text-primary"
              let bgClass = "bg-primary/10"
              if (item.name === 'Communities') { colorClass = 'text-purple-400'; bgClass = 'bg-purple-400/10' }
              if (item.name === 'Events') { colorClass = 'text-pink-400'; bgClass = 'bg-pink-400/10' }
              if (item.name === 'Local News') { colorClass = 'text-orange-400'; bgClass = 'bg-orange-400/10' }
              if (item.name === 'Marketplace') { colorClass = 'text-emerald-400'; bgClass = 'bg-emerald-400/10' }
              if (item.name === 'Jobs') { colorClass = 'text-blue-400'; bgClass = 'bg-blue-400/10' }
              if (item.name === 'Gov Services') { colorClass = 'text-indigo-400'; bgClass = 'bg-indigo-400/10' }
              if (item.name === 'Tourism') { colorClass = 'text-teal-400'; bgClass = 'bg-teal-400/10' }
              if (item.name === 'Education') { colorClass = 'text-green-400'; bgClass = 'bg-green-400/10' }
              if (item.name === 'Healthcare') { colorClass = 'text-rose-400'; bgClass = 'bg-rose-400/10' }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                    isActive
                      ? `${bgClass} ${colorClass}`
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  {isActive && <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-r-full", colorClass.replace('text-', 'bg-'))} />}
                  <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? colorClass : "text-muted-foreground")} />
                  {item.name}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold animate-pulse">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          {user && (
            <div className="p-4 border-t border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={user?.profileImage} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name ?? 'Demo User'}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user?.username ?? 'demo'}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => {
                  logout()
                  setSidebarOpen(false)
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
