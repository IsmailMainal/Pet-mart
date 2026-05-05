const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists - wrapped in try-catch for read-only environments like Vercel
const uploadDir = 'uploads';
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
} catch (err) {
  console.warn('⚠️ Could not create uploads directory. If you are on Vercel, this is expected if the directory is missing from the build.');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPG, PNG, WEBP) are allowed!'), false);
    }
  }
});

module.exports = upload;
