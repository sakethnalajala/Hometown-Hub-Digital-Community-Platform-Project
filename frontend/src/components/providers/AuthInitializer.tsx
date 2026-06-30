'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { login, logout, setLoading } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')

      if (!accessToken || !refreshToken) {
        setLoading(false)
        return
      }

      try {
        const response = await authApi.me()
        const user = response.data?.user ?? response.data
        if (user?.id && user?.email) {
          login(user, accessToken, refreshToken)
        } else {
          logout()
        }
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  return <>{children}</>
}
