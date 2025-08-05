
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

// Connect to database
connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/document'));

app.use('/api/chat', require('./routes/chat'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
