"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_1 = require("../lib/upload");
exports.uploadRouter = (0, express_1.Router)();
// POST /api/upload/image
exports.uploadRouter.post('/image', auth_middleware_1.authenticate, upload_1.upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No image provided' });
            return;
        }
        const folder = req.query.folder || 'general';
        const imageUrl = await (0, upload_1.uploadImage)(req.file.path, folder);
        res.json({ success: true, data: { url: imageUrl } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to upload image' });
    }
});
// POST /api/upload/images (multiple)
exports.uploadRouter.post('/images', auth_middleware_1.authenticate, upload_1.upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({ success: false, message: 'No images provided' });
            return;
        }
        const folder = req.query.folder || 'general';
        const urls = await Promise.all(req.files.map(f => (0, upload_1.uploadImage)(f.path, folder)));
        res.json({ success: true, data: { urls } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to upload images' });
    }
});
//# sourceMappingURL=upload.routes.js.map