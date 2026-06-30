'use client'

import { Toaster } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { SocketProvider } from '@/components/providers/SocketProvider'
import { AuthInitializer } from '@/components/providers/AuthInitializer'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <SocketProvider>
          {children}
          <Toaster />
        </SocketProvider>
      </AuthInitializer>
    </QueryClientProvider>
  )
}
