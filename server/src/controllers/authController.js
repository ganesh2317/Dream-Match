const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const { calculateStreak } = require('../utils/streak');
const { calculateProfileCompletion } = require('../services/profileCompletionService');

/**
 * Registers a new user with profile info and returns a signed JWT token.
 * 
 * @param {import('express').Request} req - Express request object containing registration payload
 * @param {import('express').Response} res - Express response object
 */
const register = async (req, res) => {
    try {
        const { fullName, username, email, password, gender, age } = req.body;

        // Validations
        if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
            return res.status(400).json({ message: 'Full name must be at least 2 characters' });
        }
        if (fullName.trim().length > 50) {
            return res.status(400).json({ message: 'Full name must be under 50 characters' });
        }

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ message: 'Username is required' });
        }
        const cleanUsername = username.trim();
        if (cleanUsername.length < 3 || cleanUsername.length > 20) {
            return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
        }
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(cleanUsername)) {
            return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
        }

        if (!password || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        if (age !== undefined && age !== null && age !== '') {
            const parsedAge = parseInt(age);
            if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
                return res.status(400).json({ message: 'Age must be a valid number between 1 and 120' });
            }
        }

        const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
        if (gender && !validGenders.includes(gender)) {
            return res.status(400).json({ message: 'Invalid gender value' });
        }

        if (email) {
            const existingEmail = await prisma.user.findUnique({
                where: { email: email.trim().toLowerCase() },
            });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Check if user exists (case-insensitive username check preferred, or match standard unique constraint)
        const existingUser = await prisma.user.findUnique({
            where: { username: cleanUsername },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                fullName: fullName.trim(),
                username: cleanUsername,
                email: email ? email.trim().toLowerCase() : null,
                password: hashedPassword,
                gender: gender || 'prefer-not-to-say',
                age: age ? parseInt(age) : null,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName.trim())}&background=random`,
            },
        });

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dream-secret', {
            expiresIn: '7d',
        });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                streakCount: 0,
                bio: null,
                role: user.role,
                status: user.status,
                _count: { followers: 0, following: 0 }
            }
        });
    } catch (error) {
        console.error('Registration error details:', error);
        res.status(500).json({ 
            message: 'Server error during registration',
            error: error.message,
            stack: error.stack
        });
    }
};

/**
 * Authenticates user credentials and returns a signed JWT token.
 * 
 * @param {import('express').Request} req - Express request object containing username and password
 * @param {import('express').Response} res - Express response object
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const cleanIdentifier = String(username).trim();
        const isEmail = cleanIdentifier.includes('@');

        // Find user by username or email
        const user = await prisma.user.findFirst({
            where: isEmail
                ? { email: { equals: cleanIdentifier.toLowerCase() } }
                : { username: { equals: cleanIdentifier } },
            include: {
                _count: {
                    select: { followers: true, following: true }
                }
            }
        });

        if (!user) {
            console.log(`Login failed: User '${cleanIdentifier}' not found.`);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Login failed: Password mismatch for user '${cleanIdentifier}'.`);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dream-secret', {
            expiresIn: '7d',
        });

        // Check streak on login
        let finalStreak = user.streakCount || 0;
        if (user.lastPostedAt) {
            try {
                const { shouldReset } = calculateStreak(user.lastPostedAt, user.streakCount || 0);
                if (shouldReset) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { streakCount: 0 }
                    });
                    finalStreak = 0;
                }
            } catch (streakErr) {
                console.error('Streak calculation warning:', streakErr.message);
            }
        }

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                streakCount: finalStreak,
                bio: user.bio,
                role: user.role,
                status: user.status,
                _count: user._count || { followers: 0, following: 0 }
            },
        });
    } catch (error) {
        console.error('Login error details:', error);
        res.status(500).json({ message: error.message || 'Server error during login' });
    }
};

/**
 * Retrieves profile data and activity details for the currently authenticated user.
 * 
 * @param {import('express').Request} req - Express request object with user context
 * @param {import('express').Response} res - Express response object
 */
const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                dreams: { orderBy: { createdAt: 'desc' } },
                sentMatches: { include: { receiver: true } },
                receivedMatches: { include: { sender: true } },
                _count: {
                    select: { followers: true, following: true }
                }
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check Streak
        const { shouldReset } = calculateStreak(user.lastPostedAt, user.streakCount);
        let finalStreak = user.streakCount;

        if (shouldReset) {
            await prisma.user.update({
                where: { id: user.id },
                data: { streakCount: 0 }
            });
            finalStreak = 0;
        }

        const profileCompletion = calculateProfileCompletion(user);

        res.json({ ...user, streakCount: finalStreak, profileCompletion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


/**
 * Updates profile bio and avatar URL for the authenticated user.
 * 
 * @param {import('express').Request} req - Express request object containing updated bio/avatarUrl
 * @param {import('express').Response} res - Express response object
 */
const updateProfile = async (req, res) => {
    try {
        const { bio, avatarUrl, age, gender } = req.body;
        // Basic validation
        if (bio && bio.length > 100) {
            return res.status(400).json({ message: 'Bio must be under 100 characters' });
        }

        let parsedAge;
        if (age !== undefined && age !== null && age !== '') {
            parsedAge = parseInt(age);
            if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
                return res.status(400).json({ message: 'Age must be a valid number between 1 and 120' });
            }
        }

        const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
        if (gender && !validGenders.includes(gender)) {
            return res.status(400).json({ message: 'Invalid gender value' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                bio: bio !== undefined ? (bio ? bio.trim() : null) : undefined,
                avatarUrl: avatarUrl || undefined,
                age: parsedAge !== undefined ? parsedAge : undefined,
                gender: gender !== undefined ? gender : undefined
            },
            include: {
                _count: {
                    select: { followers: true, following: true, dreams: true }
                }
            }
        });

        const profileCompletion = calculateProfileCompletion(updatedUser);

        res.json({
            ...updatedUser,
            profileCompletion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};


module.exports = { register, login, getMe, updateProfile };
