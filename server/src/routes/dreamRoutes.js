const express = require('express');
const { generateDreamImages, createDream, getFeed } = require('../controllers/dreamController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/generate', protect, generateDreamImages);
router.post('/', protect, createDream);
router.get('/', protect, getFeed);

module.exports = router;
