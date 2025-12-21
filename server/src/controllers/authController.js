const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const { calculateStreak } = require('../utils/streak');

const register = async (req, res) => {
    try {
        const { fullName, username, password, gender, age } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                fullName,
                username,
                password: hashedPassword,
                gender,
                age: parseInt(age) || null,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
            },
        });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                _count: {
                    select: { followers: true, following: true }
                }
            }
        });

        if (!user) {
            console.log(`Login failed: User '${username}' not found.`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Login failed: Password mismatch for user '${username}'.`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '7d',
        });

        // Check streak on login
        const { shouldReset } = calculateStreak(user.lastPostedAt, user.streakCount);
        let finalStreak = user.streakCount;

        if (shouldReset) {
            await prisma.user.update({
                where: { id: user.id },
                data: { streakCount: 0 }
            });
            finalStreak = 0;
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
                _count: user._count
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

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

        res.json({ ...user, streakCount: finalStreak });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { bio, avatarUrl } = req.body;
        // Basic validation
        if (bio && bio.length > 100) {
            return res.status(400).json({ message: 'Bio must be under 100 characters' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                bio: bio || undefined,
                avatarUrl: avatarUrl || undefined
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

module.exports = { register, login, getMe, updateProfile };
