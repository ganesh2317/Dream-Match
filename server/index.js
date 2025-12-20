const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true, // Allow all for dev simplicity or specify 'http://localhost:5173'
    credentials: true
}));
app.use(express.json());

// Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
const authRoutes = require('./src/routes/authRoutes');
const dreamRoutes = require('./src/routes/dreamRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/dreams', dreamRoutes);

app.get('/', (req, res) => {
    res.send('Dream Social API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
