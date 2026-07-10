const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const { calculateStreak } = require('../utils/streak');
const { sendVerificationOtpEmail } = require('../services/mailService');

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

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Registration error details:', error);
        res.status(500).json({ 
            message: 'Server error during registration',
            error: error.message,
            stack: error.stack
        });
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
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dream-secret', {
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

const sendOtp = async (req, res) => {
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

        // Email validation
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Email is required' });
        }
        const cleanEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if username already exists in User
        const existingUsername = await prisma.user.findUnique({
            where: { username: cleanUsername },
        });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Check if email already exists in User
        const existingEmail = await prisma.user.findUnique({
            where: { email: cleanEmail },
        });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Delete any existing PendingVerification for this email
        await prisma.pendingVerification.deleteMany({
            where: { email: cleanEmail }
        });

        // Store inside PendingVerification
        await prisma.pendingVerification.create({
            data: {
                email: cleanEmail,
                username: cleanUsername,
                password: hashedPassword,
                fullName: fullName.trim(),
                gender: gender || 'prefer-not-to-say',
                age: age ? parseInt(age) : null,
                otp,
                otpExpiresAt,
            }
        });

        // Send email via Resend
        await sendVerificationOtpEmail(cleanEmail, fullName.trim(), otp);

        res.json({ success: true });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Server error during OTP sending' });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Find PendingVerification
        const pending = await prisma.pendingVerification.findUnique({
            where: { email: cleanEmail }
        });

        if (!pending) {
            return res.status(400).json({ message: 'Verification session not found. Please register again.' });
        }

        // Check expiry
        if (pending.otpExpiresAt < new Date()) {
            await prisma.pendingVerification.delete({ where: { id: pending.id } });
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }

        // Check code
        if (pending.otp !== otp.trim()) {
            const newAttempts = pending.attempts + 1;
            if (newAttempts >= 5) {
                await prisma.pendingVerification.delete({ where: { id: pending.id } });
                return res.status(400).json({ message: 'Too many incorrect attempts. Please register again.' });
            }

            await prisma.pendingVerification.update({
                where: { id: pending.id },
                data: { attempts: newAttempts }
            });

            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // OTP is valid! Create User
        const existingUsername = await prisma.user.findUnique({
            where: { username: pending.username },
        });
        if (existingUsername) {
            await prisma.pendingVerification.delete({ where: { id: pending.id } });
            return res.status(400).json({ message: 'Username was already taken' });
        }

        const existingEmail = await prisma.user.findUnique({
            where: { email: pending.email },
        });
        if (existingEmail) {
            await prisma.pendingVerification.delete({ where: { id: pending.id } });
            return res.status(400).json({ message: 'Email was already registered' });
        }

        const user = await prisma.user.create({
            data: {
                username: pending.username,
                email: pending.email,
                password: pending.password,
                fullName: pending.fullName,
                gender: pending.gender,
                age: pending.age,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(pending.fullName)}&background=random`,
            }
        });

        // Delete PendingVerification
        await prisma.pendingVerification.delete({ where: { id: pending.id } });

        // Generate JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dream-secret', {
            expiresIn: '7d',
        });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                streakCount: 0,
                bio: null,
                _count: { followers: 0, following: 0 }
            }
        });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

module.exports = { register, login, getMe, updateProfile, sendOtp, verifyOtp };
