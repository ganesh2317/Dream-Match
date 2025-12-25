const prisma = require('../utils/prisma');

const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user.id;
        if (!query) return res.json([]);

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: query } },
                    { fullName: { contains: query } }
                ],
                NOT: { id: currentUserId }
            },
            select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                bio: true,
                _count: {
                    select: { followers: true, following: true }
                },
                // Check if current user is following each result
                followers: {
                    where: { followerId: currentUserId },
                    select: { followerId: true }
                }
            },
            take: 10
        });

        // Transform to include isFollowing boolean
        const usersWithFollowStatus = users.map(user => {
            const { followers, ...userData } = user;
            return {
                ...userData,
                isFollowing: followers.length > 0
            };
        });

        res.json(usersWithFollowStatus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error searching users' });
    }
};

const followUser = async (req, res) => {
    try {
        const { id: followingId } = req.params;
        const followerId = req.user.id;

        if (followingId === followerId) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        await prisma.follow.upsert({
            where: {
                followerId_followingId: { followerId, followingId }
            },
            update: {},
            create: { followerId, followingId }
        });

        // Create notification for the user being followed
        await prisma.notification.create({
            data: {
                type: 'FOLLOW',
                senderId: followerId,
                receiverId: followingId,
                message: 'started following you'
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error following user' });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const { id: followingId } = req.params;
        const followerId = req.user.id;

        await prisma.follow.delete({
            where: {
                followerId_followingId: { followerId, followingId }
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error unfollowing user' });
    }
};

const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const currentUserId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                dreams: { orderBy: { createdAt: 'desc' } },
                _count: {
                    select: { followers: true, following: true }
                },
                followers: {
                    where: { followerId: currentUserId },
                    select: { followerId: true }
                }
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isFollowing = user.followers.length > 0;

        // Remove followers array from output but keep count and isFollowing
        const { followers, password, ...userData } = user;

        res.json({ ...userData, isFollowing });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

module.exports = { searchUsers, followUser, unfollowUser, getProfile };
