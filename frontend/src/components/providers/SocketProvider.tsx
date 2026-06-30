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

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
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
