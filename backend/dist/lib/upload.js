"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.uploadImage = uploadImage;
exports.deleteImage = deleteImage;
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure Cloudinary if credentials exist
const hasCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);
if (hasCloudinary) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}
// Local storage config
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const localStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
        cb(null, uniqueName);
    },
});
exports.upload = (0, multer_1.default)({
    storage: localStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const isValid = allowedTypes.test(file.mimetype) && allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (isValid)
            cb(null, true);
        else
            cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
    },
});
async function uploadImage(filePath, folder = 'hometown-hub') {
    if (hasCloudinary) {
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
            folder,
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        });
        // Clean up local file after Cloudinary upload
        fs_1.default.unlinkSync(filePath);
        return result.secure_url;
    }
    // Return local URL if Cloudinary not configured
    const filename = path_1.default.basename(filePath);
    return `/uploads/${filename}`;
}
async function deleteImage(publicIdOrUrl) {
    if (hasCloudinary && !publicIdOrUrl.startsWith('/uploads')) {
        const publicId = publicIdOrUrl.split('/').slice(-1)[0].split('.')[0];
        await cloudinary_1.v2.uploader.destroy(`hometown-hub/${publicId}`);
    }
    else {
        const localPath = path_1.default.join(__dirname, '../../', publicIdOrUrl);
        if (fs_1.default.existsSync(localPath))
            fs_1.default.unlinkSync(localPath);
    }
}
//# sourceMappingURL=upload.js.map