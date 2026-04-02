import { Router } from 'express';
import { recordVisit, getVisitors, getUnseenCount, markAllSeen, deleteVisitor, deleteManyVisitors } from '../controllers/visitor.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', recordVisit);
router.get('/', authMiddleware, getVisitors);
router.get('/unseen', authMiddleware, getUnseenCount);
router.put('/seen', authMiddleware, markAllSeen);
router.delete('/bulk', authMiddleware, deleteManyVisitors);
router.delete('/:id', authMiddleware, deleteVisitor);

export default router;
