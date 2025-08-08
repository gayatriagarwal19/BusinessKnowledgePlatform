const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
}, {
  timestamps: true,
});

//Before saving a user to the database, 
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  //if the password field was modified, hash the password using bcrypt.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
