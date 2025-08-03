
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
  type: {
    type: String,
    enum: ['bill', 'feedback', 'revenue'],
  },
  size: {
    type: Number, // Size in bytes
    required: true,
  },
  upload_date: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Object,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Document', documentSchema);
