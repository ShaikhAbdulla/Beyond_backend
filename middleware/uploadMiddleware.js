const multer = require('multer');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads'); 
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be saved here
  },
  filename: (req, file, cb) => {
    // Rename file to: timestamp-originalname.jpg
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Filter to allow only images and videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|mp4|mov|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpg, png) and videos (mp4, mov, avi) are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Limit: 50MB for videos
});

module.exports = upload;