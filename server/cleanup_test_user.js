const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
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
