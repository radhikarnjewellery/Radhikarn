import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, deleteProductImage } from '../controllers/product.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post('/', authMiddleware, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), createProduct);

router.put('/:id', authMiddleware, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), updateProduct);

router.delete('/:id/image', authMiddleware, deleteProductImage);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;
