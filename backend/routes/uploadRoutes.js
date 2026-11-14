const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const verifyAdmin = require("../middleware/authMiddleware");

// Upload directory
const uploadDirectory = path.join(__dirname, "../uploads");

// Create uploads folder automatically if it does not exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Allowed image formats
const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },

    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const uniqueName =
            "jogniya-" +
            Date.now() +
            "-" +
            Math.round(Math.random() * 1000000) +
            extension;

        callback(null, uniqueName);
    }
});

// Validate image type
const fileFilter = (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
        !allowedExtensions.includes(extension) ||
        !file.mimetype.startsWith("image/")
    ) {
        return callback(
            new Error("Only JPG, JPEG, PNG and WEBP images are allowed.")
        );
    }

    callback(null, true);
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// ADMIN IMAGE UPLOAD
// POST /api/upload/image
router.post(
    "/image",
    verifyAdmin,
    (req, res) => {
        upload.single("image")(req, res, (error) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please select an image."
                });
            }

            const imageUrl = "/uploads/" + req.file.filename;

            res.status(201).json({
                success: true,
                message: "Image uploaded successfully!",
                imageUrl: imageUrl,
                filename: req.file.filename
            });
        });
    }
);

module.exports = router;