
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/message', authMiddleware, chatController.sendMessage);

module.exports = router;
