'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { login, logout, setLoading } = useAuthStore()

  useEffect(() => {
    const currentLogin = login
    const currentLogout = logout
    const currentSetLoading = setLoading
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')

      if (!accessToken || !refreshToken) {
        currentSetLoading(false)
        return
      }

      try {
        const response = await authApi.me()
        const user = response.data && 'user' in response.data ? response.data.user : response.data
        if (user?.id && user?.email) {
          currentLogin(user, accessToken, refreshToken)
        } else {
          currentLogout()
        }
      } catch {
        currentLogout()
      } finally {
        currentSetLoading(false)
      }
    }

    initAuth()
  }, [login, logout, setLoading])

  return <>{children}</>
}
