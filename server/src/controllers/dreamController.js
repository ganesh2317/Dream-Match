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

const fetchImageAsBase64 = async (url) => {
    const retries = 3;
    const delays = [2000, 4000, 8000];

    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        try {
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) {
                const bodyText = await res.text();
                
                console.error('Fetch failed detail logging:', {
                    status: res.status,
                    headers: Object.fromEntries(res.headers.entries()),
                    body: bodyText,
                    url: url
                });

                const lowercaseBody = bodyText.toLowerCase();
                const isQueueError = lowercaseBody.includes('queue timed out') || lowercaseBody.includes('queue');

                if (isQueueError && attempt < retries) {
                    const delay = delays[attempt] || 2000;
                    console.warn(`Queue issue detected. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                throw new Error(`Failed to fetch image: ${res.status}. Body: ${bodyText}`);
            }

            const buffer = await res.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const contentType = res.headers.get('content-type') || 'image/jpeg';
            return `data:${contentType};base64,${base64}`;

        } catch (error) {
            clearTimeout(timeoutId);

            const isAbort = error.name === 'AbortError';
            if (isAbort) {
                console.error(`Fetch timed out (120000ms) for URL: ${url}`);
            } else {
                console.error(`Fetch error on attempt ${attempt}:`, error);
            }

            if (attempt < retries) {
                const delay = delays[attempt] || 2000;
                console.warn(`Fetch exception encountered. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            throw error;
        }
    }
};

const generateImageFromProvider = async (prompt, seed, width, height) => {
    // 1. Together AI
    if (process.env.TOGETHER_API_KEY) {
        try {
            console.log('Generating using Together AI...');
            const res = await fetch('https://api.together.xyz/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'black-forest-labs/FLUX.1-schnell',
                    prompt: prompt,
                    width: width,
                    height: height,
                    steps: 4,
                    n: 1,
                    response_format: 'b64_json'
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data && data.data[0] && data.data[0].b64_json) {
                    return `data:image/jpeg;base64,${data.data[0].b64_json}`;
                }
            }
            console.warn('Together AI failed, falling back...');
        } catch (e) {
            console.error('Together AI Error:', e);
        }
    }

    // 2. Fal AI
    if (process.env.FAL_KEY) {
        try {
            console.log('Generating using Fal AI...');
            const res = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${process.env.FAL_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    image_size: { width, height },
                    num_inference_steps: 4,
                    enable_safety_checker: false,
                    sync_mode: true
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.images && data.images[0] && data.images[0].url) {
                    return await fetchImageAsBase64(data.images[0].url);
                }
            }
            console.warn('Fal AI failed, falling back...');
        } catch (e) {
            console.error('Fal AI Error:', e);
        }
    }

    // 3. OpenAI
    if (process.env.OPENAI_API_KEY) {
        try {
            console.log('Generating using OpenAI...');
            const res = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'dall-e-3',
                    prompt: prompt,
                    n: 1,
                    size: `${width}x${height}`,
                    response_format: 'b64_json'
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data && data.data[0] && data.data[0].b64_json) {
                    return `data:image/jpeg;base64,${data.data[0].b64_json}`;
                }
            }
            console.warn('OpenAI failed, falling back...');
        } catch (e) {
            console.error('OpenAI Error:', e);
        }
    }

    // 4. Replicate
    if (process.env.REPLICATE_API_TOKEN) {
        try {
            console.log('Generating using Replicate...');
            const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: {
                        prompt: prompt,
                        width: width,
                        height: height,
                        num_outputs: 1
                    }
                })
            });
            if (res.ok) {
                let prediction = await res.json();
                let attempts = 0;
                while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < 15) {
                    await new Promise(r => setTimeout(r, 1000));
                    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                        headers: { 'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}` }
                    });
                    if (pollRes.ok) {
                        prediction = await pollRes.json();
                    }
                    attempts++;
                }
                if (prediction.status === 'succeeded' && prediction.output && prediction.output[0]) {
                    return await fetchImageAsBase64(prediction.output[0]);
                }
            }
            console.warn('Replicate failed, falling back...');
        } catch (e) {
            console.error('Replicate Error:', e);
        }
    }

    // 5. Hugging Face
    if (process.env.HUGGINGFACE_TOKEN) {
        try {
            console.log('Generating using Hugging Face...');
            const res = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inputs: prompt })
            });
            if (res.ok) {
                const buffer = await res.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const contentType = res.headers.get('content-type') || 'image/jpeg';
                return `data:${contentType};base64,${base64}`;
            }
            console.warn('Hugging Face failed, falling back...');
        } catch (e) {
            console.error('Hugging Face Error:', e);
        }
    }

    // 6. Stability AI
    if (process.env.STABILITY_API_KEY) {
        try {
            console.log('Generating using Stability AI...');
            const formData = new FormData();
            formData.append('prompt', prompt);
            formData.append('output_format', 'jpeg');
            const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
                    'accept': 'image/*'
                },
                body: formData
            });
            if (res.ok) {
                const buffer = await res.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                return `data:image/jpeg;base64,${base64}`;
            }
            console.warn('Stability AI failed, falling back...');
        } catch (e) {
            console.error('Stability AI Error:', e);
        }
    }

    // Fallback: Pollinations.ai
    console.log('Starting Pollinations request');
    const startTime = Date.now();
    const promptLength = prompt.length;
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=${width}&height=${height}&nologo=true`;
    
    try {
        const base64Image = await fetchImageAsBase64(url);
        const elapsedTime = Date.now() - startTime;
        console.log('Finished Pollinations request');
        console.log(`Pollinations Stats: Elapsed time: ${elapsedTime}ms, Prompt length: ${promptLength}, Seed: ${seed}, HTTP status: 200`);
        return base64Image;
    } catch (e) {
        const elapsedTime = Date.now() - startTime;
        let status = 'Unknown';
        const match = e.message.match(/Failed to fetch image: (\d+)/);
        if (match) {
            status = match[1];
        }
        console.log('Finished Pollinations request');
        console.log(`Pollinations Stats: Elapsed time: ${elapsedTime}ms, Prompt length: ${promptLength}, Seed: ${seed}, HTTP status: ${status}`);
        
        return {
            success: false,
            provider: "pollinations",
            reason: "Pollinations queue timeout"
        };
    }
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

        // Professional photography quality suffix
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

        const imgPrompt = `${description}. Style: ${imgQualitySuffix}`;
        const vidPrompt = `${description}. Style: ${vidQualitySuffix}`;

        // Check if any API key is defined for fast parallel generation
        const hasApiKey = process.env.TOGETHER_API_KEY ||
                          process.env.FAL_KEY ||
                          process.env.OPENAI_API_KEY ||
                          process.env.REPLICATE_API_TOKEN ||
                          process.env.HUGGINGFACE_TOKEN ||
                          process.env.STABILITY_API_KEY;

        if (hasApiKey) {
            console.log('API key detected. Generating all images in parallel on backend...');
            const imagePromises = [1, 2, 3, 4].map(async (i) => {
                const seed = Math.floor(Math.random() * 9999999) + i;
                return await generateImageFromProvider(imgPrompt, seed, 512, 512);
            });
            const videoPromise = (async () => {
                const seed = Math.floor(Math.random() * 9999999);
                return await generateImageFromProvider(vidPrompt, seed, 512, 896);
            })();

            const images = await Promise.all(imagePromises);
            const videoUrl = await videoPromise;
            
            const failedImage = images.find(img => img && typeof img === 'object' && img.success === false);
            if (failedImage) {
                return res.status(504).json(failedImage);
            }
            if (videoUrl && typeof videoUrl === 'object' && videoUrl.success === false) {
                return res.status(504).json(videoUrl);
            }
            
            return res.json({ images, videoUrl });
        }

        // If no API key, return prompt metadata so client can fetch sequentially
        console.log('No API key detected. Returning metadata for client-side sequential generation...');
        const variations = [1, 2, 3, 4].map(i => {
            const seed = Math.floor(Math.random() * 9999999) + i;
            return { seed, prompt: imgPrompt };
        });
        const videoSeed = Math.floor(Math.random() * 9999999);

        res.json({
            pending: true,
            variations,
            video: { seed: videoSeed, prompt: vidPrompt }
        });
    } catch (error) {
        console.error('Image Generation Error:', error);
        res.status(500).json({ message: 'Error generating visuals' });
    }
};

const generateSingleImage = async (req, res) => {
    try {
        const { prompt, seed, width = 512, height = 512 } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }
        console.log(`Generating single image with seed ${seed}`);
        const imageBase64 = await generateImageFromProvider(prompt, seed, width, height);
        if (imageBase64 && typeof imageBase64 === 'object' && imageBase64.success === false) {
            return res.status(504).json(imageBase64);
        }
        res.json({ image: imageBase64 });
    } catch (error) {
        console.error('Single Image Generation Error:', error);
        res.status(500).json({ message: 'Error generating image variation' });
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

        // Increment streak only if user hasn't posted today
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { lastPostedAt: true, streakCount: true }
        });

        let newStreak = currentUser.streakCount;
        const now = new Date();

        if (!currentUser.lastPostedAt) {
            newStreak = 1;
        } else {
            const diff = differenceInCalendarDays(currentUser.lastPostedAt, now);
            if (diff === 1) {
                newStreak = currentUser.streakCount + 1;
            } else if (diff >= 2) {
                newStreak = 1;
            }
            // If diff is 0, they already posted today; streak remains unchanged
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                streakCount: newStreak,
                lastPostedAt: now
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
                },
                comments: {
                    include: {
                        user: {
                            select: { id: true, username: true, avatarUrl: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
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

module.exports = { generateDreamImages, generateSingleImage, createDream, getFeed, likeDream, commentDream, viewDream, getMatches };
