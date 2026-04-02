import { Router } from 'express';
import { getCategories, createCategory, deleteCategory, updateCategory } from '../controllers/category.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Public routes
router.get('/', getCategories);

// Protected admin routes
router.post('/', authMiddleware, upload.single('image'), createCategory);
router.put('/:id', authMiddleware, upload.single('image'), updateCategory);
router.delete('/:id', authMiddleware, deleteCategory);

export default router;
