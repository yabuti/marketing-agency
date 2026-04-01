const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/images';
    if (file.mimetype.startsWith('video/')) folder = 'uploads/videos';
    // Route news images to their own folder
    if (req.baseUrl && req.baseUrl.includes('/news')) folder = 'uploads/news';
    // Route path media to their own folder
    if (req.baseUrl && req.baseUrl.includes('/paths')) folder = 'uploads/paths';
    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only images (jpg, png, webp) and videos (mp4, mov, webm) are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

module.exports = upload;
