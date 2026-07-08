const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');

const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed'), false);
  }
};

let uploadProfile, uploadProject, uploadCert, uploadResume, uploadGeneral;

if (useCloudinary) {
  // Profile photos storage
  const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'portfolio/profile',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'fill', quality: 'auto' }],
    },
  });

  // Project images storage
  const projectStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'portfolio/projects',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 675, crop: 'fill', quality: 'auto' }],
    },
  });

  // Certification images storage
  const certStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'portfolio/certifications',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      transformation: [{ quality: 'auto' }],
    },
  });

  // Resume storage
  const resumeStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'portfolio/resume',
      allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
      resource_type: 'auto',
    },
  });

  // General image storage
  const generalStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'portfolio/general',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'ico'],
      transformation: [{ quality: 'auto' }],
    },
  });

  uploadProfile = multer({ storage: profileStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
  uploadProject = multer({ storage: projectStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
  uploadCert = multer({ storage: certStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
  uploadResume = multer({ storage: resumeStorage, limits: { fileSize: 10 * 1024 * 1024 } });
  uploadGeneral = multer({ storage: generalStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
} else {
  // Local storage fallback
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localDiskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  uploadProfile = multer({ storage: localDiskStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
  uploadProject = multer({ storage: localDiskStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
  uploadCert = multer({ storage: localDiskStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
  uploadResume = multer({ storage: localDiskStorage, limits: { fileSize: 10 * 1024 * 1024 } });
  uploadGeneral = multer({ storage: localDiskStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
}

// Middleware to rewrite file paths to public HTTP URLs when using local storage
const localUrlMiddleware = (req, res, next) => {
  if (req.file && !useCloudinary) {
    req.file.path = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  }
  if (req.files && !useCloudinary) {
    if (Array.isArray(req.files)) {
      req.files.forEach((file) => {
        file.path = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      });
    } else {
      // For fields object
      Object.keys(req.files).forEach((key) => {
        req.files[key].forEach((file) => {
          file.path = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        });
      });
    }
  }
  next();
};

// Safe delete helper for both Cloudinary and local files
const deleteFile = async (publicId, isRaw = false) => {
  if (!publicId) return;
  if (useCloudinary) {
    try {
      if (isRaw) {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      } else {
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (err) {
      console.error('Cloudinary delete error:', err.message);
    }
  } else {
    try {
      const filePath = path.join(__dirname, '../uploads', publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Local file delete error:', err.message);
    }
  }
};

module.exports = {
  uploadProfile,
  uploadProject,
  uploadCert,
  uploadResume,
  uploadGeneral,
  localUrlMiddleware,
  deleteFile,
};
