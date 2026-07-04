const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

let dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    try {
        if (!fs.existsSync(tmpDbPath)) {
            const originalDbPath = path.join(__dirname, '../../prisma/dev.db');
            const fallbackDbPath = path.join(process.cwd(), 'prisma/dev.db');
            const source = fs.existsSync(originalDbPath) ? originalDbPath : fallbackDbPath;
            
            if (fs.existsSync(source)) {
                fs.copyFileSync(source, tmpDbPath);
            }
        }
        dbUrl = 'file:/tmp/dev.db';
    } catch (e) {
        console.error('Error managing SQLite on Vercel:', e);
    }
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl
        }
    }
});

module.exports = prisma;
