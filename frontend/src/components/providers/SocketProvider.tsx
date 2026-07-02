'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'

const SocketContext = createContext<Socket | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken } = useAuthStore()
  const { addNotification } = useNotificationStore()
  const socketRef = useRef<Socket | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      socketRef.current?.disconnect()
      socketRef.current = null
      const timeoutId = window.setTimeout(() => {
        setSocket(null)
      }, 0)
      return () => window.clearTimeout(timeoutId)
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
      // Next.js's trailingSlash:false 308-redirects any request ending in
      // "/" to the bare path — fine for polling (fetch follows redirects)
      // but WebSocket upgrades can't follow redirects and just fail. The
      // engine.io client normally forces a trailing slash by default
      // (addTrailingSlash), so disable that and use the bare path, which
      // both the Next.js rewrite and the backend's engine.io server accept.
      path: '/socket.io',
      addTrailingSlash: false,
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

    socketRef.current?.disconnect()
    socketRef.current = newSocket
    const timeoutId = window.setTimeout(() => {
      setSocket(newSocket)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
      newSocket.disconnect()
      if (socketRef.current === newSocket) {
        socketRef.current = null
      }
    }
  }, [accessToken, addNotification, isAuthenticated])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
