// comments
import { Router as R1 } from 'express';
import { listComments, createComment, deleteComment, approveComment, rejectComment } from '../controllers/commentController.js';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth.js';
const comments = R1();
comments.get('/',              optionalAuth,                          listComments);
comments.post('/',             authenticate,                          createComment);
comments.delete('/:id',        authenticate,                          deleteComment);
comments.patch('/:id/approve', authenticate, requireRole('admin'),    approveComment);
comments.patch('/:id/reject',  authenticate, requireRole('admin'),    rejectComment);
export { comments as default };
