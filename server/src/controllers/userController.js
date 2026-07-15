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

        await prisma.follow.deleteMany({
            where: { followerId, followingId }
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
                dreams: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: {
                            select: { likes: true, comments: true }
                        },
                        likes: {
                            where: { userId: currentUserId },
                            select: { userId: true }
                        }
                    }
                },
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

        // Fetch compatibility score from Match model
        const match = await prisma.match.findFirst({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: user.id },
                    { senderId: user.id, receiverId: currentUserId }
                ]
            }
        });

        // Compute mutual dream keywords
        const currentUserDreams = await prisma.dream.findMany({
            where: { userId: currentUserId },
            select: { description: true }
        });

        const getKeywords = (desc) => {
            if (!desc) return [];
            return desc.toLowerCase()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                .split(/\s+/)
                .filter(w => w.length > 4);
        };

        const currentUserKeywords = new Set(currentUserDreams.flatMap(d => getKeywords(d.description)));
        const profileUserKeywords = new Set(user.dreams.flatMap(d => getKeywords(d.description)));
        const mutualInterests = [...profileUserKeywords].filter(w => currentUserKeywords.has(w));

        // Format user dreams with likes indicators
        const formattedDreams = user.dreams.map(dream => {
            const { likes, ...dreamData } = dream;
            return {
                ...dreamData,
                isLiked: likes.length > 0
            };
        });

        const compatibilityScore = match ? match.score : (mutualInterests.length > 0 ? 0.5 + Math.min(0.49, mutualInterests.length * 0.1) : 0.0);

        // Remove followers array and password
        const { followers, password, dreams, ...userData } = user;

        res.json({
            ...userData,
            dreams: formattedDreams,
            isFollowing,
            compatibilityScore,
            mutualInterests: mutualInterests.slice(0, 5),
            recentActivity: formattedDreams.length > 0 
                ? `Shared a dream on ${new Date(formattedDreams[0].createdAt).toLocaleDateString()}`
                : 'Exploring the dreamscape'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

const getFollowers = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        const follows = await prisma.follow.findMany({
            where: { followingId: id },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarUrl: true,
                        bio: true,
                        followers: {
                            where: { followerId: currentUserId },
                            select: { followerId: true }
                        }
                    }
                }
            }
        });

        const users = follows.map(f => {
            const { followers, ...userData } = f.follower;
            return {
                ...userData,
                isFollowing: followers.length > 0
            };
        });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching followers' });
    }
};

const getFollowing = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        const follows = await prisma.follow.findMany({
            where: { followerId: id },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarUrl: true,
                        bio: true,
                        followers: {
                            where: { followerId: currentUserId },
                            select: { followerId: true }
                        }
                    }
                }
            }
        });

        const users = follows.map(f => {
            const { followers, ...userData } = f.following;
            return {
                ...userData,
                isFollowing: followers.length > 0
            };
        });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching following' });
    }
};

const getDreamLikes = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        const likes = await prisma.like.findMany({
            where: { dreamId: id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarUrl: true,
                        bio: true,
                        followers: {
                            where: { followerId: currentUserId },
                            select: { followerId: true }
                        }
                    }
                }
            }
        });

        const users = likes.map(l => {
            const { followers, ...userData } = l.user;
            return {
                ...userData,
                isFollowing: followers.length > 0
            };
        });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dream likes' });
    }
};

module.exports = { searchUsers, followUser, unfollowUser, getProfile, getFollowers, getFollowing, getDreamLikes };
