const express = require('express');
const { getItems, addItem, removeItem } = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');
const validateBody = require('../middleware/validate');
const { validateWatchlistItem } = require('../utils/validators');

const router = express.Router();

router.use(protect);

router.get('/', getItems);
router.post('/', validateBody(validateWatchlistItem), addItem);
router.delete('/:movieId', removeItem);

module.exports = router;
