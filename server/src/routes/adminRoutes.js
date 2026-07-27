const express = require('express');
const {
    getDashboardStats,
    getUsers,
    updateUserStatus,
    deleteUser,
    getDreams,
    updateDreamStatus,
    deleteDream,
    getVisuals,
    retryVisualGeneration,
    deleteVisual,
    getMessageAnalytics,
    getMatchAnalytics,
    getNotificationStats,
    getAdvancedAnalytics,
    getErrorLogs,
    clearErrorLogs,
    getSettings,
    updateSettings
} = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

/**
 * All routes in this router require administrator privileges.
 */
router.use(protectAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Get system dashboard aggregate statistics and performance metrics
 * @access  Private (Admin)
 */
router.get('/stats', getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get paginated user list with filter search support
 * @access  Private (Admin)
 */
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

/**
 * @route   GET /api/admin/dreams
 * @desc    Get paginated dream feed data for moderation
 * @access  Private (Admin)
 */
router.get('/dreams', getDreams);
router.put('/dreams/:id', updateDreamStatus);
router.delete('/dreams/:id', deleteDream);

/**
 * @route   GET /api/admin/visuals
 * @desc    Get visual generation queue statuses
 * @access  Private (Admin)
 */
router.get('/visuals', getVisuals);
router.post('/visuals/:id/retry', retryVisualGeneration);
router.delete('/visuals/:id', deleteVisual);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get message, match, and notification analytical metrics
 * @access  Private (Admin)
 */
router.get('/messages', getMessageAnalytics);
router.get('/matches', getMatchAnalytics);
router.get('/notifications', getNotificationStats);
router.get('/analytics', getAdvancedAnalytics);

/**
 * @route   GET /api/admin/errors
 * @desc    Get system error logs recorded in the database
 * @access  Private (Admin)
 */
router.get('/errors', getErrorLogs);
router.delete('/errors', clearErrorLogs);

/**
 * @route   GET /api/admin/settings
 * @desc    Get and update global platform configuration settings
 * @access  Private (Admin)
 */
router.get('/settings', getSettings);
router.post('/settings', updateSettings);

module.exports = router;
