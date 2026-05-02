import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import config from "../config";

// ------------------------------------------------
// 🔹 Multer Local Storage
// ------------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    cb(null, `${baseName}-${Date.now()}${ext}`);
  }
});

// ------------------------------------------------
// 🔹 File Filter (Allow only images)
// ------------------------------------------------
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, JPG, and WEBP images are allowed."));
  }

  cb(null, true);
};

// ------------------------------------------------
// 🔹 Multer Upload Middleware
// ------------------------------------------------
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// ------------------------------------------------
// 🔹 Upload File to Cloudinary
// ------------------------------------------------
async function uploadToCloudinary(file: Express.Multer.File) {
  try {
    cloudinary.config({
      cloud_name: config.cloudinary.cloud_name,
      api_key: config.cloudinary.api_key,
      api_secret: config.cloudinary.api_secret,
    });

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      public_id: `${file.filename.split(".")[0]}`, // filename without extension
      folder: "user-avatars",
      transformation: [
        { width: 600, height: 600, crop: "fill" },
        { quality: "auto" },
      ],
    });

    // Remove local file after Cloudinary upload
    fs.unlinkSync(file.path);

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  } catch (error) {
    // Cleanup file if upload failed
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw error;
  }
}

// ------------------------------------------------
// 🔹 Export
// ------------------------------------------------
export const fileUploader = {
  upload,
  uploadToCloudinary,
};
