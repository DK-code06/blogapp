import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getUser, updateProfile, followUser, searchUsers } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`)
});
const upload = multer({ storage });
const router = Router();
router.get('/search', authenticate, searchUsers);
router.get('/:id', authenticate, getUser);
router.put('/profile', authenticate, upload.single('avatar'), updateProfile);
router.post('/:id/follow', authenticate, followUser);
export default router;
