'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'

const SocketContext = createContext<Socket | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { isAuthenticated, accessToken } = useAuthStore()
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    // Single-origin: connect to the same domain that served the app. The
    // `/socket.io` path is reverse-proxied to the backend by Next.js rewrites
    // (see next.config.ts), so the backend host is never exposed to the browser
    // and there is no cross-origin handshake. Polling is listed first because
    // it survives edge reverse-proxying reliably; the client upgrades to a
    // WebSocket when the environment allows it.
    const socketUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SOCKET_URL || 'https://hometown-hub-backend-un1i.onrender.com'

    const newSocket = io(socketUrl, {
      path: '/socket.io',
      auth: { token: accessToken },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    })

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected')
    })

    newSocket.on('notification:new', (notification) => {
      addNotification(notification)
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/icons/icon-192x192.png',
        })
      }
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected')
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [isAuthenticated, accessToken])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
