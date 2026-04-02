import { Router } from 'express';
import { addAddress, updateAddress, deleteAddress, updateProfile, uploadAvatar, getAllUsersWithStats, deleteUser } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/addresses', addAddress);
router.put('/addresses', updateAddress);
router.delete('/addresses', deleteAddress);
router.put('/profile', updateProfile);
router.post('/avatar', uploadAvatar);
router.get('/admin/all', authMiddleware, getAllUsersWithStats);
router.delete('/admin/:id', authMiddleware, deleteUser);

export default router;
