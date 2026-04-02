import { Router } from 'express';
import { getDashboardStats, getPlatformHealth } from '../controllers/admin.controller';
import { verifyAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', verifyAdmin as any, getDashboardStats as any);
router.get('/health', verifyAdmin as any, getPlatformHealth as any);

export default router;
