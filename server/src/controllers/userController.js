/**
 * @file Controller handling user profile search, follow, and unfollow operations.
 * @module userController
 */

const prisma = require('../utils/prisma');
const { calculateProfileCompletion, getProfileCompletionForUser } = require('../services/profileCompletionService');

/**
 * Searches users by username or full name and includes follow status for the requester.
 * 
 * @param {import('express').Request} req - Express request object containing query param
 * @param {import('express').Response} res - Express response object
 */
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

/**
 * Follows a user and creates a real-time notification.
 * 
 * @param {import('express').Request} req - Express request object containing user ID in params
 * @param {import('express').Response} res - Express response object
 */
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

/**
 * Unfollows a user.
 * 
 * @param {import('express').Request} req - Express request object containing target user ID in params
 * @param {import('express').Response} res - Express response object
 */
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

        const profileCompletion = calculateProfileCompletion(user);

        res.json({
            ...userData,
            dreams: formattedDreams,
            isFollowing,
            compatibilityScore,
            mutualInterests: mutualInterests.slice(0, 5),
            recentActivity: formattedDreams.length > 0 
                ? `Shared a dream on ${new Date(formattedDreams[0].createdAt).toLocaleDateString()}`
                : 'Exploring the dreamscape',
            profileCompletion
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

const getProfileCompletion = async (req, res) => {
    try {
        const userId = req.user.id;
        const completion = await getProfileCompletionForUser(userId);
        res.json(completion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error calculating profile completion' });
    }
};

/**
 * Uploads a profile avatar and stores binary data persistently in MediaBlob model.
 */
const uploadAvatar = async (req, res) => {
    try {
        const { imageBase64, mimeType } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ message: 'Image data is required' });
        }

        // Clean base64 string if data URL prefix exists
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const mediaBlob = await prisma.mediaBlob.create({
            data: {
                data: cleanBase64,
                mimeType: mimeType || 'image/png'
            }
        });

        const avatarUrl = `/api/media/${mediaBlob.id}`;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { avatarUrl },
            select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true, age: true, gender: true }
        });

        res.json({ success: true, avatarUrl: updatedUser.avatarUrl, user: updatedUser });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ message: 'Error uploading profile picture' });
    }
};

const getBlockedUsers = async (req, res) => {
    try {
        const blockerId = req.user.id;
        const blocked = await prisma.blockedUser.findMany({
            where: { blockerId },
            include: {
                blocked: {
                    select: { id: true, username: true, fullName: true, avatarUrl: true }
                }
            }
        });
        res.json(blocked.map(b => b.blocked));
    } catch (error) {
        console.error('Error fetching blocked users:', error);
        res.status(500).json({ message: 'Error fetching blocked users' });
    }
};

const blockUser = async (req, res) => {
    try {
        const blockerId = req.user.id;
        const { id: blockedId } = req.params;

        if (blockerId === blockedId) {
            return res.status(400).json({ message: 'Cannot block yourself' });
        }

        await prisma.blockedUser.upsert({
            where: {
                blockerId_blockedId: { blockerId, blockedId }
            },
            create: { blockerId, blockedId },
            update: {}
        });

        res.json({ success: true, message: 'User blocked' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Error blocking user' });
    }
};

const unblockUser = async (req, res) => {
    try {
        const blockerId = req.user.id;
        const { id: blockedId } = req.params;

        await prisma.blockedUser.deleteMany({
            where: { blockerId, blockedId }
        });

        res.json({ success: true, message: 'User unblocked' });
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ message: 'Error unblocking user' });
    }
};

module.exports = { 
    searchUsers, 
    followUser, 
    unfollowUser, 
    getProfile, 
    getFollowers, 
    getFollowing, 
    getDreamLikes, 
    getProfileCompletion,
    uploadAvatar,
    getBlockedUsers,
    blockUser,
    unblockUser
};

