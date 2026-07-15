const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', protect, userController.searchUsers);
router.get('/profile/:username', protect, userController.getProfile);
router.post('/follow/:id', protect, userController.followUser);
router.post('/unfollow/:id', protect, userController.unfollowUser);
router.get('/:id/followers', protect, userController.getFollowers);
router.get('/:id/following', protect, userController.getFollowing);
router.get('/dreams/:id/likes', protect, userController.getDreamLikes);

module.exports = router;
