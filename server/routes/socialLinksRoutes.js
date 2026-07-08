const express = require('express');
const router = express.Router();
const { getSocialLinks, getAllSocialLinks, createSocialLink, updateSocialLink, deleteSocialLink } = require('../controllers/socialLinksController');
const { protect } = require('../middleware/auth');

router.get('/', getSocialLinks);
router.get('/all', protect, getAllSocialLinks);
router.post('/', protect, createSocialLink);
router.put('/:id', protect, updateSocialLink);
router.delete('/:id', protect, deleteSocialLink);

module.exports = router;
