import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPath = path.join(__dirname, '../', 'uncompressed-media');

// Where to store media
const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    const userFolder = path.join(__dirname, '../', 'media', `${req.user._id}`);

    fs.access(userFolder, fs.constants.F_OK | fs.constants.W_OK, (err: any) => {
      if (err && err.code === 'ENOENT') {
        console.log('No directory for user uploads, making one.');
        fs.mkdir(userFolder, { recursive: true }, (err: any) => {
          if (err) throw err;
        });
      }
    });
    cb(null, uploadPath);
  },
  filename: function (req: any, file: any, cb: any) {
    cb(null, file.originalname);
  },
});

// Filter by mimetype
const fileFilter = (req: any, file: any, cb: any) => {
  // accept
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg'
  )
    cb(null, true);
  // reject a file
  else cb(null, false);
};

const upload = multer({
  storage, // Where to store
  limits: {
    fieldSize: 1024 * 1024 * 10, // Limit to 10 mbs
  },
  fileFilter: fileFilter, // Apply filter
});

export default upload