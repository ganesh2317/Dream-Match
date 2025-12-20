const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    try {
        const user = await prisma.user.upsert({
            where: { username: 'demo' },
            update: {},
            create: {
                username: 'demo',
                fullName: 'Demo User',
                password: hashedPassword,
                gender: 'other',
                age: 25,
                avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=007AFF&color=fff'
            },
        });
        console.log('User created:', user);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
