const request = require('supertest');
const { app } = require('../index');
const prisma = require('../src/utils/prisma');

jest.setTimeout(30000);

describe('Dream Social REST API Tests', () => {
    let testUsername = `user_${Date.now()}`;
    let testPassword = 'password123';
    let testUserToken = '';

    afterAll(async () => {
        // Clean up database entries created during test
        try {
            const user = await prisma.user.findUnique({ where: { username: testUsername } });
            if (user) {
                // Delete notifications, comments, matches, dreams and user
                await prisma.notification.deleteMany({ where: { OR: [{ senderId: user.id }, { receiverId: user.id }] } });
                await prisma.comment.deleteMany({ where: { userId: user.id } });
                await prisma.match.deleteMany({ where: { OR: [{ senderId: user.id }, { receiverId: user.id }] } });
                await prisma.dream.deleteMany({ where: { userId: user.id } });
                await prisma.user.delete({ where: { id: user.id } });
            }
        } catch (error) {
            console.error('Error during test cleanup:', error);
        } finally {
            await prisma.$disconnect();
        }
    });

    test('POST /api/auth/register should fail with short password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: 'Test User',
                username: testUsername,
                password: '123'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('Password must be at least 8 characters');
    });

    test('POST /api/auth/register should succeed with valid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: 'Test User',
                username: testUsername,
                password: testPassword
            });
        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toBeDefined();
        expect(res.body.user.username).toBe(testUsername);
    });

    test('POST /api/auth/login should fail with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUsername,
                password: 'wrongpassword'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid credentials');
    });

    test('POST /api/auth/login should succeed and return JWT', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUsername,
                password: testPassword
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        testUserToken = res.body.token;
    });

    test('GET /api/dreams should fail if not authenticated', async () => {
        const res = await request(app).get('/api/dreams');
        expect(res.statusCode).toBe(401);
    });

    test('GET /api/dreams should succeed with valid JWT token', async () => {
        const res = await request(app)
            .get('/api/dreams')
            .set('Authorization', `Bearer ${testUserToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /api/dreams/generate should succeed and return metadata (pending: true)', async () => {
        const res = await request(app)
            .post('/api/dreams/generate')
            .set('Authorization', `Bearer ${testUserToken}`)
            .send({ description: 'A futuristic city in the clouds' });
        expect(res.statusCode).toBe(200);
        expect(res.body.pending).toBe(true);
        expect(Array.isArray(res.body.variations)).toBe(true);
        expect(res.body.variations.length).toBe(4);
        expect(res.body.video).toBeDefined();
        expect(res.body.video.prompt).toBeDefined();
    });

    test('POST /api/dreams/generate-single should succeed and return a Base64 image string', async () => {
        const res = await request(app)
            .post('/api/dreams/generate-single')
            .set('Authorization', `Bearer ${testUserToken}`)
            .send({
                prompt: 'A futuristic city in the clouds. Style: cyberpunk',
                seed: 12345,
                width: 128,
                height: 128
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.image).toBeDefined();
        expect(res.body.image).toContain('data:image/');
        expect(res.body.image).toContain('base64,');
    }, 30000);
});
