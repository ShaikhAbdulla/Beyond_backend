const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media_type: { type: String, enum: ['image', 'video'], required: true },
  file_url: { type: String, required: true },
  is_favorite: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Media', MediaSchema);