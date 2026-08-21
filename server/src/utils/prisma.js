/**
 * @file Database utility file initializing the Prisma client instance.
 * It dynamically configures the database connection URL based on process.env.DATABASE_URL,
 * gracefully supporting PostgreSQL in production and local SQLite fallback.
 * 
 * @module prisma
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

let dbUrl = process.env.DATABASE_URL;

if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
    if (!dbUrl.includes('connect_timeout')) {
        const separator = dbUrl.includes('?') ? '&' : '?';
        dbUrl += `${separator}connect_timeout=30&pool_timeout=30`;
    }
}

/**
 * Global PrismaClient instance used to communicate with the database.
 * Configured with dynamic datasource URL mapping.
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
