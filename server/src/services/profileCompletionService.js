/**
 * @file Service to calculate profile completion percentage and criteria status.
 * @module profileCompletionService
 */

const prisma = require('../utils/prisma');

/**
 * Calculates profile completion percentage, list of completed criteria, and remaining criteria.
 * 
 * Criteria:
 * - Profile Picture (avatarUrl): 20%
 * - Bio: 20%
 * - Age: 15%
 * - Gender: 15%
 * - First Dream (dreams count >= 1): 15%
 * - Follow Someone (following count >= 1): 15%
 * 
 * @param {Object} user - User object with attributes and optional _count or dreams/following arrays.
 * @returns {{ percentage: number, completed: string[], remaining: string[] }} Completion metrics
 */
const calculateProfileCompletion = (user) => {
    if (!user) {
        return {
            percentage: 0,
            completed: [],
            remaining: [
                "Profile Picture",
                "Bio",
                "Age",
                "Gender",
                "First Dream",
                "Follow Someone"
            ]
        };
    }

    const hasAvatar = Boolean(
        user.avatarUrl && 
        typeof user.avatarUrl === 'string' && 
        user.avatarUrl.trim() !== '' && 
        !user.avatarUrl.includes('ui-avatars.com')
    );

    const hasBio = Boolean(
        user.bio && 
        typeof user.bio === 'string' && 
        user.bio.trim().length > 0
    );

    const hasAge = Boolean(
        user.age !== null && 
        user.age !== undefined && 
        typeof user.age === 'number' && 
        user.age > 0
    );

    const hasGender = Boolean(
        user.gender && 
        typeof user.gender === 'string' && 
        user.gender.trim() !== '' && 
        user.gender !== 'prefer-not-to-say'
    );

    const dreamsCount = user._count?.dreams ?? (Array.isArray(user.dreams) ? user.dreams.length : 0);
    const hasDream = Boolean(dreamsCount > 0);

    const followingCount = user._count?.following ?? (Array.isArray(user.following) ? user.following.length : 0);
    const hasFollow = Boolean(followingCount > 0);

    const criteria = [
        { name: "Profile Picture", weight: 20, isComplete: hasAvatar },
        { name: "Bio", weight: 20, isComplete: hasBio },
        { name: "Age", weight: 15, isComplete: hasAge },
        { name: "Gender", weight: 15, isComplete: hasGender },
        { name: "First Dream", weight: 15, isComplete: hasDream },
        { name: "Follow Someone", weight: 15, isComplete: hasFollow }
    ];

    let percentage = 0;
    const completed = [];
    const remaining = [];

    for (const item of criteria) {
        if (item.isComplete) {
            percentage += item.weight;
            completed.push(item.name);
        } else {
            remaining.push(item.name);
        }
    }

    percentage = Math.min(100, Math.max(0, percentage));

    return {
        percentage,
        completed,
        remaining
    };
};

/**
 * Fetches user from DB by ID with counts and calculates profile completion.
 * 
 * @param {string} userId - User UUID
 * @returns {Promise<{ percentage: number, completed: string[], remaining: string[] }>} Completion metrics
 */
const getProfileCompletionForUser = async (userId) => {
    if (!userId) {
        return calculateProfileCompletion(null);
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            avatarUrl: true,
            bio: true,
            age: true,
            gender: true,
            _count: {
                select: {
                    dreams: true,
                    following: true
                }
            }
        }
    });

    return calculateProfileCompletion(user);
};

module.exports = {
    calculateProfileCompletion,
    getProfileCompletionForUser
};
