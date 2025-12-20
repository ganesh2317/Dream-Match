const prisma = require('../utils/prisma');

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
        const userId = req.user.id; // From auth middleware

        const dream = await prisma.dream.create({
            data: {
                description,
                imageUrl,
                userId,
            },
        });

        // Update streak
        await prisma.user.update({
            where: { id: userId },
            data: { streakCount: { increment: 1 }, lastPostedAt: new Date() }
        });

        res.status(201).json(dream);
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
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(dreams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feed' });
    }
};

module.exports = { generateDreamImages, createDream, getFeed };
