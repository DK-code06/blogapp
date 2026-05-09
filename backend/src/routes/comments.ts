import { Router } from 'express';
import { getComments, createComment, likeComment, deleteComment } from '../controllers/commentController';
import { authenticate } from '../middleware/auth';
const router = Router();
router.get('/post/:postId', authenticate, getComments);
router.post('/post/:postId', authenticate, createComment);
router.post('/:id/like', authenticate, likeComment);
router.delete('/:id', authenticate, deleteComment);
export default router;
