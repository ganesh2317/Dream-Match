/**
 * @file authMiddleware.js
 * Middleware for validating JWT authentication tokens on protected API routes.
 */

const jwt = require('jsonwebtoken');

/**
 * Authentication middleware that verifies the JWT token provided in the Authorization header.
 * Decodes the JWT token payload and attaches user information to the request object.
 * Responds with HTTP 401 Unauthorized if the token is missing, expired, or invalid.
 * 
 * @param {import('express').Request} req - Express request object containing authorization headers
 * @param {import('express').Response} res - Express response object used to return authorization errors
 * @param {import('express').NextFunction} next - Express next middleware callback function
 * @returns {void}
 */
const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dream-secret');
            req.user = decoded; // { id: ... }
            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
