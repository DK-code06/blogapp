import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { createPost, getPosts, getPost, updatePost, deletePost, likePost, getUserPosts } from '../controllers/postController';
import { authenticate } from '../middleware/auth';

// 1. Configure Cloudinary securely using Environment Variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Set up the Cloudinary Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luminary_posts', // Creates a specific folder in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  } as any, 
});

// 3. Initialize Multer with Cloudinary and the 5MB size limit
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.get('/', authenticate, getPosts);
router.post('/', authenticate, upload.single('image'), createPost);
router.get('/user/:userId', authenticate, getUserPosts);
router.get('/:id', authenticate, getPost);
router.put('/:id', authenticate, upload.single('image'), updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, likePost);

export default router;