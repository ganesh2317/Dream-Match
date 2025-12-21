
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    const username = 'demo';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { username },
        update: {},
        create: {
            username,
            fullName: 'Demo User',
            password: hashedPassword,
            avatarUrl: 'https://ui-avatars.com/api/?name=Demo&background=random',
            streakCount: 5, // Testing streak
        },
    });

    console.log(`User created: ${user.username} / ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
