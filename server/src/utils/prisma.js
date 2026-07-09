const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.warn('⚠️ WARNING: DATABASE_URL environment variable is not defined. Falling back to SQLite file.');
    dbUrl = 'file:./dev.db';
}

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

// Log a detailed warning if production is running without a valid PostgreSQL protocol
if (process.env.NODE_ENV === 'production' && !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('❌ CRITICAL CONFIG ERROR: DATABASE_URL does not start with postgresql:// or postgres:// in production!');
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl
        }
    }
});

module.exports = prisma;
