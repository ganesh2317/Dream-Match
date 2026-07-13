const express = require('express');
const { 
    generateDreamImages, 
    generateSingleImage, 
    createDream, 
    getFeed, 
    likeDream, 
    commentDream, 
    viewDream, 
    getMatches,
    triggerVideoGeneration,
    getVideoStatus,
    getVisualsFeed,
    getIndividualVideo
} = require('../controllers/dreamController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Static routes MUST come before /:id parameterized routes ---
router.post('/generate', protect, generateDreamImages);
router.post('/generate-single', protect, generateSingleImage);
router.get('/visuals', protect, getVisualsFeed);
router.get('/matches', protect, getMatches);

router.post('/', protect, createDream);
router.get('/', protect, getFeed);

// --- Parameterized routes ---
router.post('/:id/generate-video', protect, triggerVideoGeneration);
router.get('/:id/video-status', protect, getVideoStatus);
router.get('/:id/video', protect, getIndividualVideo);
router.post('/:id/like', protect, likeDream);
router.post('/:id/comment', protect, commentDream);
router.post('/:id/view', protect, viewDream);

module.exports = router;
