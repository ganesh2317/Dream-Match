const prisma = require('../utils/prisma');
const { differenceInCalendarDays } = require('../utils/streak');

// Mock AI Image Generation
const generateDreamImages = async (req, res) => {
    try {
        const { description } = req.body;

        // In a real app, call OpenAI/Stability API here.
        // Serving mock images for now.
        const mockImages = [
            'https://images.unsplash.com/photo-1518022525094-218670c9b7dd?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&q=80&w=800'
        ];

        res.json({ images: mockImages });
    } catch (error) {
        res.status(500).json({ message: 'Error generating images' });
    }
};

const createDream = async (req, res) => {
    try {
        const { description, imageUrl } = req.body;
        const userId = req.user.id;

        // Always increment streak for every post (Activity based streak)
        // This satisfies the user request "Posted 2 dreams -> Streak 2"
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                streakCount: { increment: 1 },
                lastPostedAt: new Date()
            }
        });

        const dream = await prisma.dream.create({
            data: {
                description,
                imageUrl,
                userId,
            },
        });

        res.status(201).json({ ...dream, newStreak: user.streakCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving dream' });
    }
};

const getFeed = async (req, res) => {
    try {
        const dreams = await prisma.dream.findMany({
            include: {
                user: {
                    select: { id: true, username: true, avatarUrl: true, streakCount: true }
                },
                _count: {
                    select: { likes: true, comments: true }
                },
                likes: {
                    where: { userId: req.user ? req.user.id : undefined }, // Check if current user liked
                    select: { userId: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform to add "isLiked"
        const finalDreams = dreams.map(d => ({
            ...d,
            isLiked: d.likes.length > 0
        }));

        res.json(finalDreams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feed' });
    }
};

const likeDream = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const existing = await prisma.like.findUnique({
            where: { userId_dreamId: { userId, dreamId: id } }
        });

        if (existing) {
            await prisma.like.delete({ where: { id: existing.id } });
            res.json({ liked: false });
        } else {
            await prisma.like.create({ data: { userId, dreamId: id } });
            res.json({ liked: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error toggling like' });
    }
};

const commentDream = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user.id;

        const comment = await prisma.comment.create({
            data: { text, dreamId: id, userId },
            include: { user: true }
        });
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error commenting' });
    }
};

const viewDream = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.dream.update({
            where: { id },
            data: { views: { increment: 1 } }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Error viewing' });
    }
};

module.exports = { generateDreamImages, createDream, getFeed, likeDream, commentDream, viewDream };
