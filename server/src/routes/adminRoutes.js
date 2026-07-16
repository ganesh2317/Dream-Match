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

// Apply role protection across all admin routes
router.use(protectAdmin);

router.get('/stats', getDashboardStats);

router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/dreams', getDreams);
router.put('/dreams/:id', updateDreamStatus);
router.delete('/dreams/:id', deleteDream);

router.get('/visuals', getVisuals);
router.post('/visuals/:id/retry', retryVisualGeneration);
router.delete('/visuals/:id', deleteVisual);

router.get('/messages', getMessageAnalytics);
router.get('/matches', getMatchAnalytics);
router.get('/notifications', getNotificationStats);
router.get('/analytics', getAdvancedAnalytics);

router.get('/errors', getErrorLogs);
router.delete('/errors', clearErrorLogs);

router.get('/settings', getSettings);
router.post('/settings', updateSettings);

module.exports = router;
