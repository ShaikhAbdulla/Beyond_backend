const express = require('express');
const router = express.Router();
const Artwork = require('../models/ArtWork');
const protect = require('../middleware/authMiddleware');


router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;
    const query = { userId: req.user.id };
    
    if (req.query.type) query.mediaType = req.query.type;

    const total = await Artwork.countDocuments(query);
    const media = await Artwork.find(query)
      .sort({ createdAt: -1 }) 
      .limit(limit)
      .skip(skipIndex)
      .select('-__v'); 

    res.json({
      page,
      limit,
      totalRecords: total,
      totalPages: Math.ceil(total / limit),
      data: media
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.patch('/:id/favorite', protect, async (req, res) => {
  try {
    
    const media = await Artwork.findOne({ _id: req.params.id, userId: req.user.id });
    if (!media) return res.status(404).json({ message: "Media not found" });

    const newStatus = !media.is_favorite;
    const updatedMedia = await Artwork.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { is_favorite: newStatus } },
      { new: true } 
    );

    res.json(updatedMedia);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/favorites', protect, async (req, res) => {
  try {
    const favorites = await Artwork.find({ userId: req.user.id, is_favorite: true });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const upload = require('../middleware/uploadMiddleware'); 


router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    const protocol = req.get('host').includes('localhost') ? 'http' : 'https';
    const fullUrl = `${protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const newArtwork = new Artwork({
      userId: req.user.id,
      mediaUrl: fullUrl, 
      mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      title: req.body.title || `Post_${Date.now()}`,
      artist: req.body.artist || "Unknown Artist"
    });

    await newArtwork.save();
    res.status(201).json({ message: "Upload success", data: newArtwork });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const artwork = await Artwork.findOne({ _id: req.params.id, userId: req.user.id });
    if (!artwork) return res.status(404).json({ message: "Not found" });
    res.json(artwork);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;