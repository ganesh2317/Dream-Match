/**
 * @file Database utility file initializing the Prisma client instance.
 * It dynamically configures the database connection URL based on the environment variables.
 * Under Vercel environment, it automatically configures a local SQLite fallback database.
 * 
 * @module prisma
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

let dbUrl = process.env.DATABASE_URL;

if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
    dbUrl = 'postgresql://neondb_owner:npg_0gkbtyH4hNYu@ep-lucky-lake-ahhl1z70-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
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

/**
 * Global PrismaClient instance used to communicate with the database.
 * Configured with dynamic datasource URL mapping for PostgreSQL or SQLite fallbacks.
 * 
 * @type {PrismaClient}
 */
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl
        }
    }
});

module.exports = prisma;
