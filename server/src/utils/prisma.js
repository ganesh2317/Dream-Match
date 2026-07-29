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

if (!dbUrl) {
    dbUrl = 'file:./dev.db';
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
