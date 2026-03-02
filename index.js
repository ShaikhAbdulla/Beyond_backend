const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const galleryRoutes = require('./routes/gallery');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));
// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);

// Database Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://db:27017/media_gallery';
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});