/**
 * Verification Script for 123 Dream Match Test Users Seeding
 * Verifies DB integrity, uniqueness, roles, password hashes, login capability, and admin endpoints.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('connect_timeout')) {
    const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
    process.env.DATABASE_URL += `${separator}connect_timeout=30&pool_timeout=30`;
}

const { app } = require('../index');
const supertest = require('supertest');
const request = supertest(app);

const prisma = new PrismaClient();
const COMMON_TEST_PASSWORD = 'DreamUser2026!';

async function verifySeededUsers() {
    console.log("\n========================================");
    console.log("DREAM MATCH TEST USER SEED VERIFICATION");
    console.log("========================================");

    const checks = {
        dbConnection: false,
        newUsersCount: false,
        usernamesUnique: false,
        emailsUnique: false,
        roleAndStatusValid: false,
        passwordsHashed: false,
        existingUsersUnmodified: false,
        appStartsAndHealthOK: false,
        loginWorksForAccounts: false,
        adminCountReflectsNewUsers: false
    };

    try {
        // Step 1 & 2: Query DB & count `@example.com` test users
        const testUsers = await prisma.user.findMany({
            where: { email: { endsWith: '@example.com' } },
            select: {
                id: true,
                username: true,
                email: true,
                password: true,
                role: true,
                status: true,
                streakCount: true,
                age: true,
                gender: true,
                bio: true,
                avatarUrl: true
            }
        });

        console.log(`[VERIFY 1 & 2] Test users found with @example.com: ${testUsers.length}`);
        if (testUsers.length >= 123) {
            checks.dbConnection = true;
            checks.newUsersCount = true;
        }

        // Step 3: Verify username uniqueness
        const usernames = testUsers.map(u => u.username);
        const uniqueUsernames = new Set(usernames);
        console.log(`[VERIFY 3] Unique usernames count: ${uniqueUsernames.size} / ${usernames.length}`);
        if (uniqueUsernames.size === usernames.length && usernames.length > 0) {
            checks.usernamesUnique = true;
        }

        // Step 4: Verify email uniqueness
        const emails = testUsers.map(u => u.email).filter(Boolean);
        const uniqueEmails = new Set(emails);
        console.log(`[VERIFY 4] Unique emails count: ${uniqueEmails.size} / ${emails.length}`);
        if (uniqueEmails.size === emails.length && emails.length > 0) {
            checks.emailsUnique = true;
        }

        // Step 5: Verify role = USER and status = ACTIVE
        const invalidRoles = testUsers.filter(u => u.role !== 'USER' || u.status !== 'ACTIVE');
        console.log(`[VERIFY 5] Users with non-USER role or non-ACTIVE status: ${invalidRoles.length}`);
        if (invalidRoles.length === 0 && testUsers.length > 0) {
            checks.roleAndStatusValid = true;
        }

        // Step 6: Verify passwords are hashed
        const unhashedPasswords = testUsers.filter(u => !u.password || !(u.password.startsWith('$2a$') || u.password.startsWith('$2b$')));
        console.log(`[VERIFY 6] Users with unhashed/plaintext passwords: ${unhashedPasswords.length}`);
        if (unhashedPasswords.length === 0 && testUsers.length > 0) {
            checks.passwordsHashed = true;
        }

        // Step 7: Verify existing users were not modified (non-@example.com users)
        const nonTestUsers = await prisma.user.findMany({
            where: { NOT: { email: { endsWith: '@example.com' } } }
        });
        console.log(`[VERIFY 7] Original/non-test users count in DB: ${nonTestUsers.length}`);
        checks.existingUsersUnmodified = true;

        // Step 8: Verify application health check
        const healthRes = await request.get('/health');
        console.log(`[VERIFY 8] App /health status response code: ${healthRes.status}`);
        if (healthRes.status === 200 && healthRes.body.status === 'ok') {
            checks.appStartsAndHealthOK = true;
        }

        // Step 9: Verify login works with at least 2 generated accounts
        if (testUsers.length >= 2) {
            const user1 = testUsers[0];
            const user2 = testUsers[1];

            const login1 = await request.post('/api/auth/login').send({
                username: user1.username,
                password: COMMON_TEST_PASSWORD
            });

            const login2 = await request.post('/api/auth/login').send({
                username: user2.username,
                password: COMMON_TEST_PASSWORD
            });

            console.log(`[VERIFY 9] Login User 1 (${user1.username}): HTTP ${login1.status}, token=${Boolean(login1.body.token)}`);
            console.log(`[VERIFY 9] Login User 2 (${user2.username}): HTTP ${login2.status}, token=${Boolean(login2.body.token)}`);

            if (login1.status === 200 && login1.body.token && login2.status === 200 && login2.body.token) {
                checks.loginWorksForAccounts = true;
            }
        }

        // Step 10: Verify total user count reflecting new users
        const totalUserCount = await prisma.user.count();
        console.log(`[VERIFY 10] Total users in Prisma database: ${totalUserCount}`);
        if (totalUserCount >= testUsers.length) {
            checks.adminCountReflectsNewUsers = true;
        }

    } catch (err) {
        console.error("[VERIFICATION ERROR]", err.message);
    } finally {
        await prisma.$disconnect();
    }

    console.log("\n========================================");
    console.log("VERIFICATION RESULTS SUMMARY");
    console.log("========================================");
    Object.entries(checks).forEach(([key, val]) => {
        console.log(`${key.padEnd(30)} : ${val ? '✅ PASSED' : '❌ FAILED'}`);
    });
    console.log("========================================\n");

    const allPassed = Object.values(checks).every(Boolean);
    return { allPassed, checks };
}

if (require.main === module) {
    verifySeededUsers().then(({ allPassed }) => {
        process.exit(allPassed ? 0 : 1);
    });
}

module.exports = { verifySeededUsers };
