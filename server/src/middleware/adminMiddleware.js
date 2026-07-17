const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

/**
 * Middleware to enforce admin-only access routes.
 * Decodes the JWT authorization header, verifies user existence,
 * checks that the account is active, and verifies the user has the 'ADMIN' role.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
const protectAdmin = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dream-secret');
            
            // Fetch the user from DB to verify role and account status
            const user = await prisma.user.findUnique({
                where: { id: decoded.id }
            });

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (user.status !== 'ACTIVE') {
                return res.status(403).json({ message: `Access denied: Your account status is ${user.status.toLowerCase()}.` });
            }

            if (user.role !== 'ADMIN') {
                return res.status(403).json({ message: 'Access denied: Administrator privileges required.' });
            }

            req.user = user; // Attach full user record
            return next();
        } catch (error) {
            console.error('Admin verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protectAdmin };
