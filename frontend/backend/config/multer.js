// config/multer.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder for uploads
    cb(null, path.join(__dirname, '../../frontend/public/uploads/'));
  },
  filename: function (req, file, cb) {
    // Create a unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const venueStorage = multer.diskStorage({

    destination: (req,file,cb) => {
      cb(null,Date.now()+path.extname(file.originalname));
    },
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  // Allow only images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed!'), false);
  }
};

// Configure multer with the storage and file filter options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
    files: 5 // Maximum of 5 files per upload
  }
});

export default upload;