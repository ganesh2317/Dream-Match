const prisma = require('../utils/prisma');
const { differenceInCalendarDays } = require('../utils/streak');

// AI Image & Visual Generation using Pollinations.ai (Enhanced for Accuracy & Realism)
// Uses intelligent keyword extraction and real-world photographic references

// Helper function to extract and enhance keywords from dream description
const extractKeyElements = (description) => {
    const lowerDesc = description.toLowerCase();

    // Common subject categories with realistic descriptors
    const subjectEnhancements = {
        // Animals
        dog: 'real dog, detailed fur texture, natural canine features',
        cat: 'real cat, detailed fur texture, realistic feline features',
        bird: 'real bird, detailed feathers, natural avian features',
        horse: 'real horse, detailed coat, muscular anatomy',
        fish: 'real fish, detailed scales, underwater lighting',
        // People
        person: 'real human, natural skin texture, realistic proportions',
        man: 'real man, natural skin texture, realistic male features',
        woman: 'real woman, natural skin texture, realistic female features',
        child: 'real child, natural skin texture, youthful features',
        // Nature
        tree: 'real tree, detailed bark texture, natural foliage',
        flower: 'real flower, detailed petals, natural botanical features',
        mountain: 'real mountain, rocky texture, atmospheric perspective',
        ocean: 'real ocean, water reflections, natural wave patterns',
        forest: 'real forest, detailed vegetation, dappled sunlight',
        river: 'real river, water reflections, natural current flow',
        // Objects
        car: 'real car, detailed body work, realistic reflections',
        house: 'real house, architectural details, natural materials',
        building: 'real building, architectural details, urban environment',
        // Weather/Time
        sunset: 'golden hour lighting, warm orange and pink tones, dramatic sky',
        sunrise: 'early morning light, soft pink and blue tones, misty atmosphere',
        rain: 'rain droplets, wet surfaces, overcast lighting',
        snow: 'snow covered, winter atmosphere, cold blue tones',
        night: 'nighttime setting, moonlight, stars visible'
    };

    // Scene composition elements
    const compositionEnhancements = [];

    // Detect and add appropriate subject enhancements
    const detectedSubjects = [];
    for (const [keyword, enhancement] of Object.entries(subjectEnhancements)) {
        if (lowerDesc.includes(keyword)) {
            detectedSubjects.push(enhancement);
        }
    }

    // Add lighting based on context
    if (!lowerDesc.includes('sunset') && !lowerDesc.includes('sunrise') && !lowerDesc.includes('night')) {
        compositionEnhancements.push('natural daylight');
    }

    // Add perspective hints
    if (lowerDesc.includes('flying') || lowerDesc.includes('above') || lowerDesc.includes('sky')) {
        compositionEnhancements.push('aerial perspective, wide angle view');
    } else if (lowerDesc.includes('close') || lowerDesc.includes('face') || lowerDesc.includes('detail')) {
        compositionEnhancements.push('close-up shot, shallow depth of field');
    } else {
        compositionEnhancements.push('medium shot, balanced composition');
    }

    // Build enhanced prompt
    const subjectPart = detectedSubjects.length > 0 ? detectedSubjects.join(', ') : '';
    const compositionPart = compositionEnhancements.join(', ');

    return { subjectPart, compositionPart };
};

const generateDreamImages = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ message: 'Description is required' });
        }

        console.log(`Generating high-fidelity visuals for: ${description}`);

        // Extract key elements for accurate representation
        const { subjectPart, compositionPart } = extractKeyElements(description);

        // Professional photography quality suffix - emphasis on REAL and ACCURATE
        const imgQualitySuffix = [
            'award-winning National Geographic photograph',
            'shot on Canon EOS R5, 85mm lens',
            'hyperrealistic, photorealistic',
            'RAW photo, 8k UHD resolution',
            'natural lighting, true-to-life colors',
            'masterpiece, highly detailed',
            'no blur, sharp focus',
            subjectPart,
            compositionPart
        ].filter(Boolean).join(', ');

        const vidQualitySuffix = [
            'cinematic film still',
            'hyperrealistic visualization',
            'atmospheric lighting',
            'highly detailed environment',
            'professional cinematography',
            'award-winning visual',
            subjectPart,
            compositionPart
        ].filter(Boolean).join(', ');

        // Build the full prompt with clear instruction structure
        const imgPrompt = `${description}. Style: ${imgQualitySuffix}`;
        const vidPrompt = `${description}. Style: ${vidQualitySuffix}`;

        const encodedImgPrompt = encodeURIComponent(imgPrompt);
        const encodedVidPrompt = encodeURIComponent(vidPrompt);

        // Generate 4 image variations with different seeds
        const images = [1, 2, 3, 4].map(i => {
            const seed = Math.floor(Math.random() * 9999999) + i;
            return `https://image.pollinations.ai/prompt/${encodedImgPrompt}?seed=${seed}&width=1024&height=1024&nologo=true&enhance=true`;
        });

        // Generate a "video" URL (tall format for reels/stories)
        const vidSeed = Math.floor(Math.random() * 9999999);
        const videoUrl = `https://image.pollinations.ai/prompt/${encodedVidPrompt}?seed=${vidSeed}&width=1024&height=1792&nologo=true&enhance=true`;

        console.log(`Successfully generated high-fidelity visuals with enhanced prompts`);
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
