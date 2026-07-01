import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Configure Cloudinary if credentials exist
const hasCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Local storage config
// Use a writable temp directory in serverless environments (Vercel),
// otherwise use the repository `uploads` folder for local development.
export const uploadsDir = process.env.VERCEL === '1'
  ? path.join(os.tmpdir(), 'hometown-hub-uploads')
  : path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    // If mkdir fails in a read-only environment, log and continue (Cloudinary may be used).
    console.warn('Could not create uploads directory:', (err as any)?.message || err);
  }
}

const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage: localStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(file.mimetype) && allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (isValid) cb(null, true);
    else cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
  },
});

export async function uploadImage(filePath: string, folder = 'hometown-hub'): Promise<string> {
  if (hasCloudinary) {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });
    // Clean up local file after Cloudinary upload
    fs.unlinkSync(filePath);
    return result.secure_url;
  }
  // Return local URL if Cloudinary not configured
  const filename = path.basename(filePath);
  return `/uploads/${filename}`;
}

export async function deleteImage(publicIdOrUrl: string): Promise<void> {
  if (hasCloudinary && !publicIdOrUrl.startsWith('/uploads')) {
    const publicId = publicIdOrUrl.split('/').slice(-1)[0].split('.')[0];
    await cloudinary.uploader.destroy(`hometown-hub/${publicId}`);
  } else {
    const localPath = path.join(__dirname, '../../', publicIdOrUrl);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  }
}
