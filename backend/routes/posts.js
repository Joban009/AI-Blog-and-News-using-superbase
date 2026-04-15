import { Router } from 'express';
import {
  listPosts, getPost, createPost, updatePost,
  deletePost, publishPost, rejectPost,
} from '../controllers/postController.js';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth.js';

const router = Router();
router.get('/',              optionalAuth, listPosts);
router.get('/:slug',         optionalAuth, getPost);
router.post('/',             authenticate, createPost);
router.put('/:id',           authenticate, updatePost);
router.delete('/:id',        authenticate, deletePost);
router.post('/:id/publish',  authenticate, requireRole('admin'), publishPost);
router.post('/:id/reject',   authenticate, requireRole('admin'), rejectPost);
export default router;
