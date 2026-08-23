const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/users/search
 * @desc    Search active users by username or full name
 * @access  Private
 */
router.get('/search', protect, userController.searchUsers);

/**
 * @route   GET /api/users/profile-completion
 * @desc    Get profile completion percentage and missing items for authenticated user
 * @access  Private
 */
router.get('/profile-completion', protect, userController.getProfileCompletion);

/**
 * @route   POST /api/users/avatar
 * @desc    Upload profile picture binary persistently to MediaBlob model
 * @access  Private
 */
router.post('/avatar', protect, userController.uploadAvatar);

/**
 * @route   GET /api/users/blocked
 * @desc    Get list of users blocked by the authenticated user
 * @access  Private
 */
router.get('/blocked', protect, userController.getBlockedUsers);

/**
 * @route   POST /api/users/block/:id
 * @desc    Block a user by ID
 * @access  Private
 */
router.post('/block/:id', protect, userController.blockUser);

/**
 * @route   POST /api/users/unblock/:id
 * @desc    Unblock a user by ID
 * @access  Private
 */
router.post('/unblock/:id', protect, userController.unblockUser);

/**
 * @route   GET /api/users/profile/:username
 * @desc    Get user profile details by username
 * @access  Private
 */
router.get('/profile/:username', protect, userController.getProfile);

/**
 * @route   POST /api/users/follow/:id
 * @desc    Follow a target user by ID
 * @access  Private
 */
router.post('/follow/:id', protect, userController.followUser);

/**
 * @route   POST /api/users/unfollow/:id
 * @desc    Unfollow a target user by ID
 * @access  Private
 */
router.post('/unfollow/:id', protect, userController.unfollowUser);

/**
 * @route   GET /api/users/:id/followers
 * @desc    Retrieve followers for a specific user ID
 * @access  Private
 */
router.get('/:id/followers', protect, userController.getFollowers);

/**
 * @route   GET /api/users/:id/following
 * @desc    Retrieve following list for a specific user ID
 * @access  Private
 */
router.get('/:id/following', protect, userController.getFollowing);

/**
 * @route   GET /api/users/dreams/:id/likes
 * @desc    Retrieve list of users who liked a dream
 * @access  Private
 */
router.get('/dreams/:id/likes', protect, userController.getDreamLikes);

module.exports = router;
