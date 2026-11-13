const express = require('express');
const {
  getProfile,
  updateProfile,
  addRecentlyViewed,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validateBody = require('../middleware/validate');
const { validateProfileUpdate } = require('../utils/validators');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', validateBody(validateProfileUpdate), updateProfile);
router.post('/recently-viewed', addRecentlyViewed);

module.exports = router;
