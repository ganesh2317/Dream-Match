const prisma = require('../utils/prisma');
const { exec } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isProduction = process.env.NODE_ENV === 'production';
const videoStorageDir = isProduction
    ? path.join(os.tmpdir(), 'dreammatch-videos')
    : path.resolve(__dirname, '..', '..', '..', 'videos');

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
    async checkStatus(jobId, dreamId) {
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
        this.jobs.set(jobId, {
            status: 'PENDING',
            videoUrl: '',
            createdAt: Date.now()
        });
        console.log(`[VideoProvider: ${this.name}] Initialized job ${jobId} for prompt: "${prompt}"`);
        return { jobId, status: 'PENDING' };
    }

    async compileVideo(dreamId) {
        try {
            const dream = await prisma.dream.findUnique({ where: { id: dreamId } });
            if (!dream || !dream.imageUrl) {
                console.warn(`[VideoProvider: ${this.name}] Dream image not found for id ${dreamId}`);
                return null;
            }

            if (!fs.existsSync(videoStorageDir)) {
                fs.mkdirSync(videoStorageDir, { recursive: true });
            }

            const tempDir = os.tmpdir();
            const inputImagePath = path.join(tempDir, `input_${dreamId}.jpg`);
            const outputVideoPath = path.join(videoStorageDir, `${dreamId}.mp4`);

            // If it already exists, just return it
            if (fs.existsSync(outputVideoPath)) {
                return `/api/videos/${dreamId}.mp4`;
            }

            // Write image to disk
            if (dream.imageUrl.startsWith('data:image/')) {
                const base64Data = dream.imageUrl.replace(/^data:image\/\w+;base64,/, "");
                fs.writeFileSync(inputImagePath, Buffer.from(base64Data, 'base64'));
            } else {
                // Fetch from URL
                const response = await fetch(dream.imageUrl);
                const buffer = await response.arrayBuffer();
                fs.writeFileSync(inputImagePath, Buffer.from(buffer));
            }

            // Run ffmpeg
            await new Promise((resolve, reject) => {
                const filterComplex = `[0:v]scale=512:896,zoompan=z='min(zoom+0.0015,1.5)':x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2':d=125:s=512x896[vid]; ` +
                                       `color=color=0x7c3aed@0.12:size=512x896:duration=5[col]; ` +
                                       `[vid][col]overlay=shortest=1,vignette=angle=0.5,eq=brightness=0.03:contrast=1.1:saturation=1.2,noise=alls=12:allf=t`;

                const ffmpegCmd = `"${ffmpegStatic}" -y -loop 1 -t 5 -i "${inputImagePath}" -filter_complex "${filterComplex}" -c:v libx264 -pix_fmt yuv420p "${outputVideoPath}"`;

                console.log(`[VideoProvider: ${this.name}] Compiling video: ${ffmpegCmd}`);

                exec(ffmpegCmd, (error, stdout, stderr) => {
                    // Clean up input image
                    try {
                        if (fs.existsSync(inputImagePath)) {
                            fs.unlinkSync(inputImagePath);
                        }
                    } catch (err) {}

                    if (error) {
                        console.error(`[VideoProvider: ${this.name}] ffmpeg error:`, stderr || error);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            console.log(`[VideoProvider: ${this.name}] Completed video generation: /api/videos/${dreamId}.mp4`);
            return `/api/videos/${dreamId}.mp4`;
        } catch (e) {
            console.error(`[VideoProvider: ${this.name}] Error compiling video:`, e);
            return null;
        }
    }

    async checkStatus(jobId, dreamId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            return { status: 'FAILED', videoUrl: null };
        }

        const elapsed = Date.now() - job.createdAt;
        if (elapsed > 6000) {
            if (job.status !== 'COMPLETED') {
                console.log(`[VideoProvider: ${this.name}] Starting ffmpeg compilation for job ${jobId}...`);
                const videoUrl = await this.compileVideo(dreamId);
                if (videoUrl) {
                    job.status = 'COMPLETED';
                    job.videoUrl = videoUrl;
                    console.log(`[VideoProvider: ${this.name}] Completed job ${jobId}`);
                } else {
                    job.status = 'FAILED';
                }
            }
        } else if (elapsed > 2000) {
            job.status = 'PROCESSING';
        }

        return { status: job.status, videoUrl: job.status === 'COMPLETED' ? job.videoUrl : null };
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

        // Run initialization asynchronously and sequentially
        this.init();
    }

    async init() {
        // Clean up legacy hotlinked video URLs on startup
        await this.migrateLegacyUrls();

        // Recover any pending/processing jobs from the database on startup
        await this.recoverPendingJobs();

        // Rebuild completed videos that are missing from disk
        await this.rebuildMissingVideos();
    }

    async migrateLegacyUrls() {
        try {
            const legacyDreams = await prisma.dream.findMany({
                where: {
                    OR: [
                        { videoUrl: { contains: 'mixkit.co' } },
                        { videoUrl: { contains: 'lorem.video' } }
                    ]
                }
            });
            for (const dream of legacyDreams) {
                await prisma.dream.update({
                    where: { id: dream.id },
                    data: {
                        videoUrl: `/api/videos/${dream.id}.mp4`,
                        videoStatus: 'COMPLETED',
                        videoProvider: 'Luma Dream Machine'
                    }
                });
            }
            if (legacyDreams.length > 0) {
                console.log(`[VideoQueue] Migrated ${legacyDreams.length} legacy/placeholder video URLs to local persistent endpoint.`);
            }
        } catch (e) {
            console.error('[VideoQueue] Failed to migrate legacy URLs:', e);
        }
    }

    async rebuildMissingVideos() {
        try {
            const completedDreams = await prisma.dream.findMany({
                where: {
                    videoStatus: 'COMPLETED',
                    videoUrl: { startsWith: '/api/videos/' }
                }
            });
            let rebuildCount = 0;
            for (const dream of completedDreams) {
                const filename = dream.videoUrl.replace('/api/videos/', '');
                const filePath = path.join(videoStorageDir, filename);
                if (!fs.existsSync(filePath)) {
                    console.log(`[VideoQueue] Missing video file for dream ${dream.id}. Re-enqueuing for compilation...`);
                    await this.enqueue(dream.id, dream.description, 'luma');
                    rebuildCount++;
                }
            }
            if (rebuildCount > 0) {
                console.log(`[VideoQueue] Re-enqueued ${rebuildCount} missing videos for compilation.`);
            }
        } catch (e) {
            console.error('[VideoQueue] Failed to rebuild missing videos:', e);
        }
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
                provider.jobs.set(jobId, {
                    status: dream.videoStatus,
                    videoUrl: '',
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
                const { status, videoUrl } = await provider.checkStatus(jobId, dreamId);
                
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
