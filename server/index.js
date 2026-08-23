/**
 * Dream Match Backend Application Entry Point
 * Express API server with Socket.io real-time websockets integration.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const { Server } = require('socket.io');

const { execSync } = require('child_process');

dotenv.config();

// Ensure Database Schema columns are automatically in sync with Prisma schema on startup
try {
    console.log('[DB] Synchronizing database schema with Prisma db push...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
} catch (dbErr) {
    console.warn('[DB] Automatic prisma db push notice:', dbErr.message);
}

const app = express();

const PORT = process.env.PORT || 3000;

// Trust reverse proxies (Vercel, Render) for accurate client IP rate-limiting
app.set('trust proxy', 1);

// Security Headers (CSP disabled to avoid blocking third-party media; CORP set to cross-origin for video media streaming)
app.use(helmet({ 
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Policy with secure allowed-origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy violation: access from origin is not allowed.'));
        }
    },
    credentials: true
}));

app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const isProduction = process.env.NODE_ENV === 'production';
const videoStorageDir = isProduction
    ? path.join(os.tmpdir(), 'dreammatch-videos')
    : path.resolve(__dirname, '..', 'videos');

if (!fs.existsSync(videoStorageDir)) {
    fs.mkdirSync(videoStorageDir, { recursive: true });
}

// Media CORS & CORP middleware mounted BEFORE rate limiters so video playback is never blocked by CORS/CORP or HTTP 429
app.use('/api/videos', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Authorization, Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Accept-Ranges', 'bytes');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

app.get('/api/videos/:filename', async (req, res, next) => {
    try {
        const filePath = path.join(videoStorageDir, req.params.filename);

        // 1. If video is already cached on disk, serve with high-performance native streaming
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }

        // 2. Fetch from VideoBlob database table, populate disk cache, and stream
        const dreamId = req.params.filename.replace('.mp4', '');
        const prisma = require('./src/utils/prisma');
        const videoRecord = await prisma.videoBlob.findUnique({
            where: { dreamId },
            select: { data: true }
        });

        if (videoRecord && videoRecord.data) {
            const buffer = Buffer.from(videoRecord.data, 'base64');
            fs.writeFileSync(filePath, buffer);
            return res.sendFile(filePath);
        }

        // 3. If video record is missing but dream exists, re-enqueue for generation on demand
        const dream = await prisma.dream.findUnique({
            where: { id: dreamId },
            select: { id: true, description: true, imageUrl: true }
        });

        if (dream) {
            console.log(`[MediaEndpoint] Video missing on disk and DB for dream ${dreamId}. Triggering auto-compile...`);
            const { videoQueue } = require('./src/services/videoService');
            videoQueue.enqueue(dream.id, dream.description, 'luma');
        }

        return res.status(404).send('Video generation in progress or file not found');
    } catch (err) {
        next(err);
    }
});

// Persistent Media Binary Serving Endpoint (avatars, message attachments)
app.use('/api/media', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.get('/api/media/:id', async (req, res, next) => {
    try {
        const prisma = require('./src/utils/prisma');
        const media = await prisma.mediaBlob.findUnique({
            where: { id: req.params.id }
        });
        if (!media || !media.data) {
            return res.status(404).json({ message: 'Media binary not found' });
        }
        const buffer = Buffer.from(media.data, 'base64');
        res.setHeader('Content-Type', media.mimeType || 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.send(buffer);
    } catch (err) {
        next(err);
    }
});


// Rate Limiting (configured with trust proxy support)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // generous limit per client IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 login/register attempts per individual IP per 15 minutes (strong brute-force defense)
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts, please try again after 15 minutes.' }
});

// Apply Rate Limiters in production
if (process.env.NODE_ENV === 'production') {
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
    app.use('/api/dreams/generate', authLimiter);
    app.use('/api', apiLimiter);
}

// Routes
const authRoutes = require('./src/routes/authRoutes');
const dreamRoutes = require('./src/routes/dreamRoutes');
const userRoutes = require('./src/routes/userRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/dreams', dreamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Dream Social API is running...');
});

// Global Error Handling Middleware
app.use(async (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err.stack || err.message);
    
    // Automatically log unhandled errors to the Prisma database ErrorLog table
    try {
        const prisma = require('./src/utils/prisma');
        await prisma.errorLog.create({
            data: {
                type: 'BACKEND',
                message: err.message || 'An unexpected backend error occurred',
                stack: err.stack || null,
                endpoint: `${req.method} ${req.originalUrl || req.url}`
            }
        });
    } catch (logError) {
        console.error('Failed to log error to database:', logError.message);
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message || 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});

const userSockets = new Map();

app.set('io', io);
app.set('userSockets', userSockets);

io.on('connection', (socket) => {

    socket.on('register', (userId) => {
        if (!userId) return;

        socket.userId = userId;

        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
        }

        userSockets.get(userId).add(socket.id);

        console.log(`User ${userId} connected (${socket.id})`);
    });

    socket.on('disconnect', () => {

        if (!socket.userId) return;

        const sockets = userSockets.get(socket.userId);

        if (sockets) {
            sockets.delete(socket.id);

            if (sockets.size === 0) {
                userSockets.delete(socket.userId);
            }
        }

        console.log(`User ${socket.userId} disconnected`);
    });

});

/**
 * Health Check
 */
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, "0.0.0.0", () => {
        console.log("======================================");
        console.log("🚀 Dream Match Backend Started");
        console.log(`🌍 Environment : ${process.env.NODE_ENV}`);
        console.log(`📡 Port        : ${PORT}`);
        console.log("======================================");
    });
}

/**
 * Handle Unexpected Errors
 */
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Promise Rejection:");
    console.error(err);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:");
    console.error(err);
});

module.exports = { app, server };