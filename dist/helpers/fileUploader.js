"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploader = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cloudinary_1 = require("cloudinary");
const config_1 = __importDefault(require("../config"));
// ------------------------------------------------
// 🔹 Multer Local Storage
// ------------------------------------------------
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path_1.default.join(process.cwd(), "/uploads");
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path_1.default.extname(file.originalname);
        const baseName = path_1.default.basename(file.originalname, ext);
        cb(null, `${baseName}-${Date.now()}${ext}`);
    }
});
// ------------------------------------------------
// 🔹 File Filter (Allow only images)
// ------------------------------------------------
const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only JPEG, PNG, JPG, and WEBP images are allowed."));
    }
    cb(null, true);
};
// ------------------------------------------------
// 🔹 Multer Upload Middleware
// ------------------------------------------------
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});
// ------------------------------------------------
// 🔹 Upload File to Cloudinary
// ------------------------------------------------
async function uploadToCloudinary(file) {
    try {
        cloudinary_1.v2.config({
            cloud_name: config_1.default.cloudinary.cloud_name,
            api_key: config_1.default.cloudinary.api_key,
            api_secret: config_1.default.cloudinary.api_secret,
        });
        const uploadResult = await cloudinary_1.v2.uploader.upload(file.path, {
            public_id: `${file.filename.split(".")[0]}`, // filename without extension
            folder: "user-avatars",
            transformation: [
                { width: 600, height: 600, crop: "fill" },
                { quality: "auto" },
            ],
        });
        // Remove local file after Cloudinary upload
        fs_1.default.unlinkSync(file.path);
        return {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
        };
    }
    catch (error) {
        // Cleanup file if upload failed
        if (fs_1.default.existsSync(file.path))
            fs_1.default.unlinkSync(file.path);
        throw error;
    }
}
// ------------------------------------------------
// 🔹 Export
// ------------------------------------------------
exports.fileUploader = {
    upload,
    uploadToCloudinary,
};
