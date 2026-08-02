/**
 * @file cleanup_test_user.js
 * @module cleanupTestUser
 * Utility script to clean up testing/onboarding data for a specific test user account.
 * Useful to reset registration and verification state during local development and testing.
 */

const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

/**
 * Deletes all related records (messages, conversations, dreams, pending verifications, user record)
 * for the test user to ensure a clean state for testing/demoing onboarding flows.
 * 
 * @returns {Promise<void>}
 */
async function run() {
    await p.pendingVerification.deleteMany({ where: { email: 'ganeshmahalatkar@gmail.com' } });
    const u = await p.user.findUnique({ where: { email: 'ganeshmahalatkar@gmail.com' } });
    if (u) {
        await p.message.deleteMany({ where: { OR: [{ senderId: u.id }, { receiverId: u.id }] } });
        await p.conversation.deleteMany({ where: { userId: u.id } });
        await p.dream.deleteMany({ where: { userId: u.id } });
        await p.user.delete({ where: { id: u.id } });
    }
    console.log('Done. User existed:', !!u);
    await p.$disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
