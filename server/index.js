const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Headers (CSP disabled to avoid blocking third-party avatars/images like ui-avatars and pollinations.ai)
app.use(helmet({ contentSecurityPolicy: false }));

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

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // limit each IP to 150 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit login/register attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts, please try again after 15 minutes.' }
});

// Apply Rate Limiters (disabled in local development to avoid blocking automated tests)
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

const path = require('path');
const fs = require('fs');
const os = require('os');
const isProduction = process.env.NODE_ENV === 'production';
const videoStorageDir = isProduction
    ? path.join(os.tmpdir(), 'dreammatch-videos')
    : path.resolve(__dirname, '..', 'videos');

if (!fs.existsSync(videoStorageDir)) {
    fs.mkdirSync(videoStorageDir, { recursive: true });
}

app.get('/api/videos/:filename', (req, res) => {
    const filePath = path.join(videoStorageDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }
    res.status(404).send('Video not found');
});

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

const http = require('http');
const { Server } = require('socket.io');

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