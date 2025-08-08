const User = require('../models/user');
const Document = require('../models/document');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  console.log('Register endpoint hit');
  const { email, password } = req.body;
  console.log('Request body:', req.body);
  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({
      email,
      password,
    });
    await user.save();
    console.log('User saved to DB');
    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err.message);
          throw err;
        }
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  console.log('Login endpoint hit');
  const { email, password } = req.body;
  console.log('Request body:', req.body);
  try {
    let user = await User.findOne({ email });
    if (!user) {
      console.log('Invalid credentials: User not found');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid credentials: Password mismatch');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err.message);
          throw err;
        }
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); //excludes the password field from the returned user object
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const documents = await Document.find({ userId: req.user.id });
    const billCount = documents.filter(doc => doc.type === 'bill').length;
    const feedbackCount = documents.filter(doc => doc.type === 'feedback').length;
    const revenueCount = documents.filter(doc => doc.type === 'revenue').length;

    res.json({
      user: { email: user.email, id: user.id },
      documentCounts: {
        bills: billCount,
        feedback: feedbackCount,
        revenue: revenueCount,
      },
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect old password' });
    }

    user.password = newPassword; // Pre-save hook in user model will hash this
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
