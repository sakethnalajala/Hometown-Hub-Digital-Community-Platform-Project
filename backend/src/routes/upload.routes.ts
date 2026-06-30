import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { upload, uploadImage } from '../lib/upload';

export const uploadRouter = Router();

// POST /api/upload/image
uploadRouter.post('/image', authenticate, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image provided' }); return;
    }
    const folder = (req.query.folder as string) || 'general';
    const imageUrl = await uploadImage(req.file.path, folder);
    res.json({ success: true, data: { url: imageUrl } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

// POST /api/upload/images (multiple)
uploadRouter.post('/images', authenticate, upload.array('images', 10), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ success: false, message: 'No images provided' }); return;
    }
    const folder = (req.query.folder as string) || 'general';
    const urls = await Promise.all(
      (req.files as Express.Multer.File[]).map(f => uploadImage(f.path, folder))
    );
    res.json({ success: true, data: { urls } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to upload images' });
  }
});
