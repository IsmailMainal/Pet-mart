const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB just in case
  fileFilter: (req, file, cb) => {
    // Log the file type to help debug
    console.log(`📁 Upload attempt: ${file.originalname} (${file.mimetype})`);
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      console.error(`❌ Upload blocked: Unsupported file type ${file.mimetype}`);
      cb(new Error('Only images (JPG, PNG, WEBP, GIF) are allowed!'), false);
    }
  }
});

module.exports = upload;
