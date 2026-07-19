/**
 * @file promote_admin.js
 * Command-line utility script to promote an existing user to the ADMIN role.
 * Usage: node promote_admin.js <username>
 * If username is not provided, defaults to 'demo'.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const username = process.argv[2] || 'demo';

/**
 * Main execution function that connects to the database, queries the user by username,
 * updates their role to 'ADMIN', and logs the updated user record.
 * 
 * @returns {Promise<void>}
 */
async function main() {
    console.log(`Promoting user "${username}" to ADMIN role...`);
    const user = await prisma.user.findUnique({
        where: { username }
    });

    if (!user) {
        console.error(`User "${username}" not found in database.`);
        process.exit(1);
    }

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
    });

    console.log(`Successfully promoted user! New record:`);
    console.log({
        id: updated.id,
        username: updated.username,
        fullName: updated.fullName,
        role: updated.role,
        status: updated.status
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
