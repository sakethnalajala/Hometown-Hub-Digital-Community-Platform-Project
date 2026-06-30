"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const auth_routes_demo_1 = require("./routes/auth.routes.demo");
const user_routes_1 = require("./routes/user.routes");
const community_routes_1 = require("./routes/community.routes");
const post_routes_1 = require("./routes/post.routes");
const comment_routes_1 = require("./routes/comment.routes");
const event_routes_1 = require("./routes/event.routes");
const notification_routes_1 = require("./routes/notification.routes");
const admin_routes_1 = require("./routes/admin.routes");
const report_routes_1 = require("./routes/report.routes");
const upload_routes_1 = require("./routes/upload.routes");
const job_routes_1 = require("./routes/job.routes");
const news_routes_1 = require("./routes/news.routes");
const tourism_routes_1 = require("./routes/tourism.routes");
const gov_routes_1 = require("./routes/gov.routes");
const marketplace_routes_1 = require("./routes/marketplace.routes");
const error_middleware_1 = require("./middleware/error.middleware");
const socket_1 = require("./socket");
const db_1 = require("./lib/db");
const firebase_1 = require("./lib/firebase");
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
// Socket.io
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
exports.io = io;
(0, socket_1.initSocket)(io);
// Security
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// CORS
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
// Static files for uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});
const demoMock_middleware_1 = require("./middleware/demoMock.middleware");
// Routes
app.use('/api', demoMock_middleware_1.demoMockMiddleware);
app.use('/api/auth', auth_routes_demo_1.authRouter);
app.use('/api/users', user_routes_1.userRouter);
app.use('/api/communities', community_routes_1.communityRouter);
app.use('/api/posts', post_routes_1.postRouter);
app.use('/api/comments', comment_routes_1.commentRouter);
app.use('/api/events', event_routes_1.eventRouter);
app.use('/api/notifications', notification_routes_1.notificationRouter);
app.use('/api/admin', admin_routes_1.adminRouter);
app.use('/api/reports', report_routes_1.reportRouter);
app.use('/api/upload', upload_routes_1.uploadRouter);
app.use('/api/jobs', job_routes_1.jobRouter);
app.use('/api/news', news_routes_1.newsRouter);
app.use('/api/tourism', tourism_routes_1.tourismRouter);
app.use('/api/gov', gov_routes_1.govRouter);
app.use('/api/marketplace', marketplace_routes_1.marketplaceRouter);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
// Error handler
app.use(error_middleware_1.errorHandler);
const PORT = Number(process.env.PORT) || 5000;
async function main() {
    try {
        // Initialize MongoDB (or demo mode if unavailable)
        await (0, db_1.connectDB)();
        // Initialize Firebase Admin
        (0, firebase_1.initFirebaseAdmin)();
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 Socket.io ready`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
            console.log(`✓ Backend is fully operational`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
main();
process.on('SIGINT', async () => {
    try {
        // Attempt to disconnect from Prisma if available
        const { prisma } = await Promise.resolve().then(() => __importStar(require('./lib/prisma'))).catch(() => ({ prisma: null }));
        if (prisma) {
            await prisma.$disconnect();
        }
    }
    catch (err) {
        // Silently fail if prisma is not available
    }
    console.log('\n👋 Server shut down gracefully');
    process.exit(0);
});
//# sourceMappingURL=index.js.map