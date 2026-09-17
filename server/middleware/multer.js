import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Broadly accept any image MIME type or valid image file extension
  const isImageMime = file.mimetype && file.mimetype.startsWith("image/");
  const isImageExt =
    file.originalname &&
    /\.(jpe?g|png|webp|gif|svg|avif|bmp|jfif|tiff|ico)$/i.test(
      file.originalname
    );

  if (isImageMime || isImageExt) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files (jpeg, png, webp, gif, avif, svg) are allowed as thumbnail"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
  },
  fileFilter,
});

export default upload;