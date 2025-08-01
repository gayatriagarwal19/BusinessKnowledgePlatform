
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  metadata: {
    type: Object,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Document', documentSchema);
