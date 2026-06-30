"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
const jwt_1 = require("./lib/jwt");
const prisma_1 = require("./lib/prisma");
function initSocket(io) {
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const payload = (0, jwt_1.verifyAccessToken)(token);
            socket.userId = payload.userId;
            socket.userRole = payload.role;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`🔌 Socket connected: ${userId}`);
        // Join user's personal room
        socket.join(`user:${userId}`);
        // Join community rooms
        socket.on('join:community', (communityId) => {
            socket.join(`community:${communityId}`);
            console.log(`👥 User ${userId} joined community room: ${communityId}`);
        });
        socket.on('leave:community', (communityId) => {
            socket.leave(`community:${communityId}`);
        });
        // Typing indicators
        socket.on('typing:start', ({ communityId }) => {
            socket.to(`community:${communityId}`).emit('user:typing', { userId });
        });
        socket.on('typing:stop', ({ communityId }) => {
            socket.to(`community:${communityId}`).emit('user:stopped-typing', { userId });
        });
        // Online status
        socket.on('disconnect', async () => {
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { lastSeen: new Date() },
            }).catch(() => { });
            console.log(`❌ Socket disconnected: ${userId}`);
        });
        // Mark notification as read via socket
        socket.on('notification:read', async (notificationId) => {
            await prisma_1.prisma.notification.updateMany({
                where: { id: notificationId, receiverId: userId },
                data: { isRead: true },
            }).catch(() => { });
        });
    });
}
//# sourceMappingURL=socket.js.map