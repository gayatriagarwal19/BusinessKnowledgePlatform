
const ChatSession = require('../models/chatSession');
const ChatMessage = require('../models/chatMessage');

exports.createSession = async (req, res) => {
  try {
    const { title } = req.body;
    const session = new ChatSession({
      userId: req.user.id,
      title,
    });
    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.sendMessage = async (req, res) => {
  try {
    // This is a placeholder for the chat implementation
    res.json({ msg: 'Not yet implemented' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ sessionId: req.params.sessionId });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
