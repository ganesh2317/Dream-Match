const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.pendingVerification.findUnique({ where: { email: 'ganeshmahalatkar@gmail.com' } })
    .then(r => { console.log('Record:', JSON.stringify(r, null, 2)); return p.$disconnect(); })
    .catch(console.error);
