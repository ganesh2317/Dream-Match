/**
 * @file authMiddleware.js
 * Middleware for validating JWT authentication tokens and checking user account status and session validity.
 */

const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

/**
 * Authentication middleware that verifies the JWT token provided in the Authorization header.
 * Checks DB status to enforce SUSPENDED/BANNED account locks and session invalidation after password changes.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware callback
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dream-secret');
            
            // Check DB to enforce SUSPENDED/BANNED locks and password revocation
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, username: true, role: true, status: true, passwordChangedAt: true }
            });

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
                return res.status(403).json({ message: `Account is ${user.status.toLowerCase()}. Access denied.` });
            }

            // Check if password was changed after token was issued
            if (user.passwordChangedAt && decoded.iat) {
                const passwordChangedTime = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
                if (passwordChangedTime > decoded.iat) {
                    return res.status(401).json({ message: 'Session expired due to password change. Please log in again.' });
                }
            }

            req.user = { id: user.id, username: user.username, role: user.role, status: user.status };
            return next();
        } catch (error) {
            console.error('Auth protect middleware error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
        }
    }


    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
