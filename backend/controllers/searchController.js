
const Document = require('../models/document');

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    const documents = await Document.find({ $text: { $search: q } });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getSimilar = async (req, res) => {
  try {
    // This is a placeholder for the semantic search implementation
    res.json({ msg: 'Not yet implemented' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
