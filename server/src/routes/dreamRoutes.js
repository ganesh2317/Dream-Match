const express = require('express');
const { generateDreamImages, createDream, getFeed, likeDream, commentDream, viewDream, getMatches } = require('../controllers/dreamController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/generate', protect, generateDreamImages);
router.post('/', protect, createDream);
router.get('/', protect, getFeed);
router.post('/:id/like', protect, likeDream);
router.post('/:id/comment', protect, commentDream);
router.post('/:id/view', protect, viewDream);
router.get('/matches', protect, getMatches);

module.exports = router;
