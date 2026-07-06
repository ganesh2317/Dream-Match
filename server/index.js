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

app.use('/api/auth', authRoutes);
app.use('/api/dreams', dreamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
    res.send('Dream Social API is running...');
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err.stack || err.message);
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
        if (userId) {
            socket.userId = userId;
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);
            console.log(`User ${userId} registered socket ${socket.id}`);
        }
    });

    socket.on('disconnect', () => {
        if (socket.userId && userSockets.has(socket.userId)) {
            const sockets = userSockets.get(socket.userId);
            sockets.delete(socket.id);
            if (sockets.size === 0) {
                userSockets.delete(socket.userId);
            }
            console.log(`User ${socket.userId} disconnected socket ${socket.id}`);
        }
    });
});

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
