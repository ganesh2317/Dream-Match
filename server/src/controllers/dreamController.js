const prisma = require('../utils/prisma');
const { differenceInCalendarDays } = require('../utils/streak');

// AI Image & Visual Generation using Pollinations.ai (Refined for Accuracy & Realism)
const generateDreamImages = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ message: 'Description is required' });
        }

        console.log(`Generating high-fidelity visuals for: ${description}`);

        // Enhanced photorealistic quality suffixes
        const imgQualitySuffix = "photorealistic, cinematic RAW photo, highly detailed texture, 8k UHD, Fujifilm XT4, professional photography, natural lighting, masterpiece, hyper-realistic, no blur";
        const vidQualitySuffix = "cinematic animation, slow motion drift, highly detailed environment, fluid movement, dream visualization, 60fps, ultra-realistic textures";

        const encodedImgPrompt = encodeURIComponent(`${description}, ${imgQualitySuffix}`);
        const encodedVidPrompt = encodeURIComponent(`${description}, ${vidQualitySuffix}`);

        // Generate 4 image variations
        const images = [1, 2, 3, 4].map(i => {
            const seed = Math.floor(Math.random() * 9999999) + i;
            return `https://image.pollinations.ai/prompt/${encodedImgPrompt}?seed=${seed}&width=1024&height=1024&nologo=true&enhance=true`;
        });

        // Generate a "video" URL
        const vidSeed = Math.floor(Math.random() * 9999999);
        const videoUrl = `https://image.pollinations.ai/prompt/${encodedVidPrompt}?seed=${vidSeed}&width=1024&height=1792&nologo=true&enhance=true`;

        console.log(`Successfully generated high-fidelity visuals for: ${description}`);
        res.json({ images, videoUrl });
    } catch (error) {
        console.error('Image Generation Error:', error);
        res.status(500).json({ message: 'Error generating visuals' });
    }
};

const createDream = async (req, res) => {
    try {
        const { description, imageUrl, videoUrl } = req.body;
        const userId = req.user.id;

        // Create the dream first with a fallback for schema mismatches
        let dream;
        try {
            dream = await prisma.dream.create({
                data: {
                    description,
                    imageUrl,
                    videoUrl,
                    userId,
                },
            });
        } catch (dbError) {
            console.error('Database Error (likely missing videoUrl column):', dbError);
            // Fallback: save without videoUrl if the column doesn't exist yet
            dream = await prisma.dream.create({
                data: {
                    description,
                    imageUrl,
                    userId,
                },
            });
        }

        // Increment streak
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                streakCount: { increment: 1 },
                lastPostedAt: new Date()
            }
        });

        // --- DREAM MATCHING LOGIC (Refined) ---
        const keywords = description.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .split(/\s+/)
            .filter(w => w.length > 4); // Only match specific longer keywords

        if (keywords.length > 0) {
            const potentialMatches = await prisma.dream.findMany({
                where: {
                    userId: { not: userId },
                    OR: keywords.map(kw => ({
                        description: { contains: kw }
                    }))
                },
                take: 10,
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
                            score: 0.99, // High score for match
                            status: 'pending'
                        }
                    });

                    // Also create a notification for the match
                    await prisma.notification.create({
                        data: {
                            type: 'MATCH',
                            senderId: userId,
                            receiverId: targetUserId,
                            message: 'shared a similar dream with you!'
                        }
                    });
                }
            }
        }

        res.status(201).json({ ...dream, newStreak: user.streakCount });
    } catch (error) {
        console.error('Post Dream Error:', error);
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

const getMatches = async (req, res) => {
    try {
        const userId = req.user.id;
        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                sender: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                receiver: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching matches' });
    }
};

module.exports = { generateDreamImages, createDream, getFeed, likeDream, commentDream, viewDream, getMatches };
