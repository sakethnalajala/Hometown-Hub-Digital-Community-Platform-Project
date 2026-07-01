import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Server as SocketServer } from 'socket.io';
import path from 'path';

import { authRouter } from './routes/auth.routes.demo';
import { userRouter } from './routes/user.routes';
import { communityRouter } from './routes/community.routes';
import { postRouter } from './routes/post.routes';
import { commentRouter } from './routes/comment.routes';
import { eventRouter } from './routes/event.routes';
import { notificationRouter } from './routes/notification.routes';
import { adminRouter } from './routes/admin.routes';
import { reportRouter } from './routes/report.routes';
import { uploadRouter } from './routes/upload.routes';
import { jobRouter } from './routes/job.routes';
import { newsRouter } from './routes/news.routes';
import { tourismRouter } from './routes/tourism.routes';
import { govRouter } from './routes/gov.routes';
import { marketplaceRouter } from './routes/marketplace.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { educationRouter } from './routes/education.routes';
import { healthcareRouter } from './routes/healthcare.routes';
import { bookmarkRouter } from './routes/bookmark.routes';
import { errorHandler } from './middleware/error.middleware';
import { initSocket } from './socket';
import { connectDB } from './lib/db';
import { initFirebaseAdmin } from './lib/firebase';

const app = express();
const httpServer = http.createServer(app);

// All browser traffic reaches this backend through the frontend's reverse
// proxy (Next.js rewrites on the single public domain). Trust the first proxy
// hop so req.ip / rate-limiting use the real client IP from X-Forwarded-For
// instead of the proxy's edge IP (otherwise every user shares one rate bucket).
app.set('trust proxy', 1);

// CORS origin policy
// Allow:
// - specific deployed frontend origin
// - all Vercel preview/prod origins: *.vercel.app
// - localhost dev
// - Requests with no Origin header (server-to-server, curl, health checks)
const ALLOWED_FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'https://hometown-hub-virid.vercel.app';
const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) return true;

  // Exact allowlist for the main deployed frontend
  if (origin === ALLOWED_FRONTEND_ORIGIN) return true;

  // Local dev
  if (origin === 'http://localhost:3000') return true;

  // Vercel deployments (production + preview)
  try {
    const hostname = new URL(origin).hostname;
    return hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

const corsOrigin = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  if (isAllowedOrigin(origin)) callback(null, true);
  else callback(new Error(`Origin ${origin} not allowed by CORS`));
};


// Socket.io
const io = new SocketServer(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initSocket(io);

// Export io for use in routes
export { io };

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

import { demoMockMiddleware } from './middleware/demoMock.middleware';

// Routes
app.use('/api', demoMockMiddleware);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/communities', communityRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/events', eventRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reports', reportRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/news', newsRouter);
app.use('/api/tourism', tourismRouter);
app.use('/api/gov', govRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/education', educationRouter);
app.use('/api/healthcare', healthcareRouter);
app.use('/api/bookmarks', bookmarkRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

async function main() {
  try {
    // Initialize MongoDB (or demo mode if unavailable)
    await connectDB();
    
    // Initialize Firebase Admin
    initFirebaseAdmin();

    // Bind to 0.0.0.0 so the service is reachable on Render (and other PaaS).
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io ready`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`✓ Backend is fully operational`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();

process.on('SIGINT', async () => {
  try {
    // Attempt to disconnect from Prisma if available
    const { prisma } = await import('./lib/prisma').catch(() => ({ prisma: null }));
    if (prisma) {
      await prisma.$disconnect();
    }
  } catch (err) {
    // Silently fail if prisma is not available
  }
  console.log('\n👋 Server shut down gracefully');
  process.exit(0);
});
