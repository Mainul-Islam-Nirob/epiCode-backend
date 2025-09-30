import multer from "multer";
const storage = multer.memoryStorage(); // for Cloudinary
const upload = multer({ storage });
export default upload;