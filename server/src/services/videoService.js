const prisma = require('../utils/prisma');

// Base class for AI Video Providers
class VideoProvider {
    constructor(name) {
        this.name = name;
    }
    // Returns { jobId, status: 'PENDING' | 'COMPLETED' | 'FAILED' }
    async generate(prompt) {
        throw new Error('Not implemented');
    }
    // Returns { status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED', videoUrl: string | null }
    async checkStatus(jobId) {
        throw new Error('Not implemented');
    }
}

// Concrete Mock Provider supporting all switchable features
// This class simulates the asynchronous generation behavior of real external APIs
// (e.g., Runway, Kling, or Luma) by keeping local state and mocking delay states.
class SimulatedProvider extends VideoProvider {
    constructor(name) {
        super(name);
        this.jobs = new Map();
    }

    async generate(prompt) {
        const jobId = `${this.name.toLowerCase()}_job_${Math.random().toString(36).substr(2, 9)}`;
        const videoUrl = this.getMockVideoUrl(prompt);
        this.jobs.set(jobId, {
            status: 'PENDING',
            videoUrl,
            createdAt: Date.now()
        });
        console.log(`[VideoProvider: ${this.name}] Initialized job ${jobId} for prompt: "${prompt}"`);
        return { jobId, status: 'PENDING' };
    }

    async checkStatus(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            return { status: 'FAILED', videoUrl: null };
        }

        // Simulate a 6 second processing delay to represent async queue processing
        const elapsed = Date.now() - job.createdAt;
        if (elapsed > 6000) {
            job.status = 'COMPLETED';
            console.log(`[VideoProvider: ${this.name}] Completed job ${jobId}`);
        } else if (elapsed > 2000) {
            job.status = 'PROCESSING';
        }

        return { status: job.status, videoUrl: job.status === 'COMPLETED' ? job.videoUrl : null };
    }

    getMockVideoUrl(description) {
        const desc = description.toLowerCase();
        if (desc.includes('fly') || desc.includes('flying') || desc.includes('city') || desc.includes('sunset') || desc.includes('above')) {
            return 'https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-city-at-sunset-124-large.mp4';
        }
        if (desc.includes('forest') || desc.includes('tree') || desc.includes('magical') || desc.includes('wood') || desc.includes('glow') || desc.includes('walk')) {
            return 'https://assets.mixkit.co/videos/preview/mixkit-mysterious-forest-with-light-beams-and-fog-42867-large.mp4';
        }
        if (desc.includes('cyberpunk') || desc.includes('neon') || desc.includes('futuristic') || desc.includes('street')) {
            return 'https://assets.mixkit.co/videos/preview/mixkit-neon-lights-in-a-futuristic-city-street-43187-large.mp4';
        }
        if (desc.includes('ocean') || desc.includes('sea') || desc.includes('wave') || desc.includes('beach') || desc.includes('water')) {
            return 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-sea-waves-on-a-sandy-beach-14022-large.mp4';
        }
        if (desc.includes('space') || desc.includes('galaxy') || desc.includes('star') || desc.includes('universe') || desc.includes('nebula')) {
            return 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-stars-in-space-loop-4861-large.mp4';
        }
        // Fallback abstract cinematic loop
        return 'https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-particles-in-motion-loop-4868-large.mp4';
    }
}

// Google Veo, Runway, Luma, Pika, Kling Providers mapping
const providers = {
    'veo': new SimulatedProvider('Google Veo'),
    'runway': new SimulatedProvider('Runway Gen-3'),
    'luma': new SimulatedProvider('Luma Dream Machine'),
    'pika': new SimulatedProvider('Pika Labs'),
    'kling': new SimulatedProvider('Kling AI')
};

// Queue system for processing video generation jobs asynchronously
class VideoQueue {
    constructor() {
        this.queue = [];
        this.activeJobs = new Map();
        this.processing = false;
        
        // Start background worker loop
        setInterval(() => this.processQueue(), 2000);

        // Recover any pending/processing jobs from the database on startup
        this.recoverPendingJobs();
    }

    async recoverPendingJobs() {
        try {
            const pendingDreams = await prisma.dream.findMany({
                where: {
                    videoStatus: { in: ['PENDING', 'PROCESSING'] }
                }
            });
            for (const dream of pendingDreams) {
                const providerKey = 'luma'; // default fallback
                const provider = providers[providerKey] || providers.luma;
                
                // Re-register the job in the simulated provider
                const jobId = `${provider.name.toLowerCase()}_job_${Math.random().toString(36).substr(2, 9)}`;
                const videoUrl = provider.getMockVideoUrl(dream.description);
                provider.jobs.set(jobId, {
                    status: dream.videoStatus,
                    videoUrl,
                    createdAt: new Date(dream.createdAt).getTime()
                });
                
                this.queue.push({
                    dreamId: dream.id,
                    jobId,
                    providerKey,
                    prompt: dream.description,
                    attempts: 0
                });
            }
            if (pendingDreams.length > 0) {
                console.log(`[VideoQueue] Recovered ${pendingDreams.length} pending video generation jobs.`);
            }
        } catch (e) {
            console.error('[VideoQueue] Failed to recover pending jobs:', e);
        }
    }

    async enqueue(dreamId, prompt, providerKey = 'luma') {
        const provider = providers[providerKey.toLowerCase()] || providers.luma;
        console.log(`[VideoQueue] Enqueued dream ${dreamId} using provider ${provider.name}`);
        
        // Initialize job on the provider
        try {
            const { jobId, status } = await provider.generate(prompt);
            
            // Save initial status to database
            await prisma.dream.update({
                where: { id: dreamId },
                data: {
                    videoStatus: status,
                    videoProvider: provider.name
                }
            });

            this.queue.push({
                dreamId,
                jobId,
                providerKey,
                prompt,
                attempts: 0
            });
        } catch (e) {
            console.error(`[VideoQueue] Failed to initialize video generation for dream ${dreamId}:`, e);
            await prisma.dream.update({
                where: { id: dreamId },
                data: { videoStatus: 'FAILED' }
            });
        }
    }

    async processQueue() {
        if (this.processing) return;
        this.processing = true;

        const activeQueue = [...this.queue];
        const toRemove = new Set();

        for (const job of activeQueue) {
            const { dreamId, jobId, providerKey } = job;
            const provider = providers[providerKey.toLowerCase()] || providers['luma'];

            try {
                const { status, videoUrl } = await provider.checkStatus(jobId);
                
                if (status === 'FAILED') {
                    if (job.attempts < 3) {
                        job.attempts = (job.attempts || 0) + 1;
                        console.warn(`[VideoQueue] Job for dream ${dreamId} failed. Retrying (Attempt ${job.attempts}/3)...`);
                        try {
                            const { jobId: newJobId, status: newStatus } = await provider.generate(job.prompt || 'Dream details');
                            job.jobId = newJobId;
                            await prisma.dream.update({
                                where: { id: dreamId },
                                data: { videoStatus: newStatus }
                            });
                        } catch (err) {
                            console.error(`[VideoQueue] Failed to recreate job on retry:`, err);
                        }
                    } else {
                        toRemove.add(dreamId);
                        await prisma.dream.update({
                            where: { id: dreamId },
                            data: { videoStatus: 'FAILED' }
                        });
                    }
                } else {
                    // Build update payload — only set videoUrl when we actually have one
                    const updateData = { videoStatus: status };
                    if (videoUrl) {
                        updateData.videoUrl = videoUrl;
                        updateData.videoDuration = 5.0;
                    }

                    await prisma.dream.update({
                        where: { id: dreamId },
                        data: updateData
                    });

                    if (status === 'COMPLETED') {
                        toRemove.add(dreamId);
                        console.log(`[VideoQueue] Job for dream ${dreamId} finished with status: ${status}`);
                    }
                }
            } catch (err) {
                console.error(`[VideoQueue] Error processing job for dream ${dreamId}:`, err.message || err);
                // Don't remove from queue on transient errors — it will retry next tick
            }
        }

        // Remove completed/failed jobs after iteration
        if (toRemove.size > 0) {
            this.queue = this.queue.filter(j => !toRemove.has(j.dreamId));
        }

        this.processing = false;
    }
}

const videoQueue = new VideoQueue();

module.exports = {
    videoQueue,
    providers
};
