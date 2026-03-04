const express = require('express');
const router = express.Router();
const Artwork = require('../models/ArtWork');
const protect = require('../middleware/authMiddleware');

// 1. GET /media (Paginated, Protected, Own Media Only)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    // MANDATORY: Ensure users can only access their own media
    const query = { userId: req.user.id };
    
    // Optional filter by type
    if (req.query.type) query.mediaType = req.query.type;

    const total = await Artwork.countDocuments(query);
    const media = await Artwork.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit)
      .skip(skipIndex)
      .select('-__v'); // This hides the "__v: 0" field from the JSON response

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

// 2. PATCH /media/:id/favorite (Toggle Favorite)
router.patch('/:id/favorite', protect, async (req, res) => {
  try {
    const media = await Artwork.findOne({ _id: req.params.id, userId: req.user.id });
    if (!media) return res.status(404).json({ message: "Media not found" });

    media.is_favorite = !media.is_favorite;
    await media.save();
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /media/favorites (Fetch only favorites)
router.get('/favorites', protect, async (req, res) => {
  try {
    const favorites = await Artwork.find({ userId: req.user.id, is_favorite: true });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const upload = require('../middleware/uploadMiddleware'); // Your multer config file

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    const newArtwork = new Artwork({
    // 1. userId from the 'protect' middleware
      userId: req.user.id, 
      
      // 2. mediaUrl: Matches your schema's required field
      mediaUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`, 
      
      // 3. title: Your schema says required: true. We use filename if no title is sent.
      title: req.body.title || `Post_${Date.now()}`, 
      
      // 4. artist: Optional field from your schema
      artist: req.body.artist || req.user.name || 'Unknown Artist',
      
      // 5. mediaType: Matches your enum ['image', 'video']
      mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
    });

    await newArtwork.save();
    res.status(201).json({ message: "Upload success", data: newArtwork });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;