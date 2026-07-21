const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpegPath = require(path.resolve(__dirname, 'server/node_modules/ffmpeg-static'));

const videosDir = path.resolve(__dirname, 'videos');
const files = fs.readdirSync(videosDir).filter(f => f.endsWith('.mp4'));

console.log(`Using ffmpeg at: ${ffmpegPath}`);
console.log(`Found ${files.length} local MP4 files in ${videosDir}:\n`);

for (const file of files) {
    const fullPath = path.join(videosDir, file);
    const stat = fs.statSync(fullPath);
    console.log(`File: ${file}`);
    console.log(`  Size: ${stat.size} bytes (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
    try {
        const out = execSync(`"${ffmpegPath}" -i "${fullPath}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        console.log(`  FFmpeg output:\n${out}`);
    } catch (e) {
        const stderr = e.stderr ? e.stderr.toString() : e.message;
        const lines = stderr.split('\n').filter(l => l.includes('Duration:') || l.includes('Stream #'));
        console.log(`  FFmpeg info:\n${lines.map(l => '    ' + l.trim()).join('\n')}`);
    }
    console.log('-----------------------------------');
}
