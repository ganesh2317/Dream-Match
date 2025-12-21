const prisma = require('../utils/prisma');
const { differenceInCalendarDays } = require('../utils/streak');

// Mock AI Image Generation
const generateDreamImages = async (req, res) => {
    try {
        const { description } = req.body;
        console.log(`Generating realistic images for: ${description}`);

        // Simplified "Training" / Keyword based selection for "Accuracy"
        const desc = description.toLowerCase();

        let mockImages = [
            'https://images.unsplash.com/photo-1518022525094-218670c9b7dd?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&q=80&w=800'
        ];

        // Realistic adjustments based on description
        if (desc.includes('forest') || desc.includes('tree') || desc.includes('nature')) {
            mockImages = [
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80&w=800'
            ];
        } else if (desc.includes('ocean') || desc.includes('sea') || desc.includes('water') || desc.includes('beach')) {
            mockImages = [
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1505118380757-91f5f45d8de4?auto=format&fit=crop&q=80&w=800'
            ];
        } else if (desc.includes('city') || desc.includes('street') || desc.includes('building') || desc.includes('night')) {
            mockImages = [
                'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800'
            ];
        } else if (desc.includes('space') || desc.includes('star') || desc.includes('galaxy') || desc.includes('alien')) {
            mockImages = [
                'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1447433589675-4aaa56a4015a?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1464802686167-b939a67e0621?auto=format&fit=crop&q=80&w=800'
            ];
        }

        // Simulate "Descriptive accuracy" by appending quality keywords if it were a real API
        const refinedPrompt = `${description}, ultra realistic, 8k resolution, cinematic lighting, dreamlike atmosphere, highly detailed`;
        console.log(`Refined AI Prompt: ${refinedPrompt}`);

        res.json({ images: mockImages });
    } catch (error) {
        res.status(500).json({ message: 'Error generating images' });
    }
};

const createDream = async (req, res) => {
    try {
        const { description, imageUrl } = req.body;
        const userId = req.user.id;

        // Create the dream first
        const dream = await prisma.dream.create({
            data: {
                description,
                imageUrl,
                userId,
            },
        });

        // Increment streak
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                streakCount: { increment: 1 },
                lastPostedAt: new Date()
            }
        });

        // --- DREAM MATCHING LOGIC ---
        // Find other dreams with similar keywords (simplified)
        const keywords = description.toLowerCase().split(/\s+/).filter(w => w.length > 3);

        if (keywords.length > 0) {
            const potentialMatches = await prisma.dream.findMany({
                where: {
                    userId: { not: userId },
                    OR: keywords.map(kw => ({
                        description: { contains: kw }
                    }))
                },
                take: 5,
                include: { user: true }
            });

            // Create match records for unique users
            const matchedUserIds = [...new Set(potentialMatches.map(pm => pm.userId))];

            for (const targetUserId of matchedUserIds) {
                // Check if match already exists
                const existing = await prisma.match.findFirst({
                    where: {
                        OR: [
                            { senderId: userId, receiverId: targetUserId },
                            { senderId: targetUserId, receiverId: userId }
                        ]
                    }
                });

                if (!existing) {
                    await prisma.match.create({
                        data: {
                            senderId: userId,
                            receiverId: targetUserId,
                            score: 0.95, // High score for keyword match
                            status: 'pending'
                        }
                    });
                }
            }
        }

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
        const { id: dreamId } = req.params;
        const userId = req.user.id;

        // Toggle like
        const existingLike = await prisma.like.findUnique({
            where: { userId_dreamId: { userId, dreamId } }
        });

        if (existingLike) {
            await prisma.like.delete({ where: { id: existingLike.id } });
            res.json({ liked: false });
        } else {
            await prisma.like.create({
                data: { userId, dreamId }
            });

            // Create notification for dream owner
            const dream = await prisma.dream.findUnique({
                where: { id: dreamId },
                select: { userId: true }
            });

            if (dream && dream.userId !== userId) {
                await prisma.notification.create({
                    data: {
                        type: 'LIKE',
                        senderId: userId,
                        receiverId: dream.userId,
                        dreamId,
                        message: 'liked your dream'
                    }
                });
            }
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
