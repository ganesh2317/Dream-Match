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
