import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from './lib/jwt';
import { prisma } from './lib/prisma';

export function initSocket(io: Server): void {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const payload = verifyAccessToken(token);
      (socket as any).userId = payload.userId;
      (socket as any).userRole = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`🔌 Socket connected: ${userId}`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join community rooms
    socket.on('join:community', (communityId: string) => {
      socket.join(`community:${communityId}`);
      console.log(`👥 User ${userId} joined community room: ${communityId}`);
    });

    socket.on('leave:community', (communityId: string) => {
      socket.leave(`community:${communityId}`);
    });

    // Typing indicators
    socket.on('typing:start', ({ communityId }: { communityId: string }) => {
      socket.to(`community:${communityId}`).emit('user:typing', { userId });
    });

    socket.on('typing:stop', ({ communityId }: { communityId: string }) => {
      socket.to(`community:${communityId}`).emit('user:stopped-typing', { userId });
    });

    // Online status
    socket.on('disconnect', async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { lastSeen: new Date() },
      }).catch(() => {});
      console.log(`❌ Socket disconnected: ${userId}`);
    });

    // Mark notification as read via socket
    socket.on('notification:read', async (notificationId: string) => {
      await prisma.notification.updateMany({
        where: { id: notificationId, receiverId: userId },
        data: { isRead: true },
      }).catch(() => {});
    });
  });
}
