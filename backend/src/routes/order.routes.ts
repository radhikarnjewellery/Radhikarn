import { Router } from 'express';
import { getOrders, getOrderById, createOrder, updateOrderStatus, trackOrder, getOrdersByEmail, uploadPaymentScreenshot, deleteOrder, deleteManyOrders } from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/', createOrder);
router.post('/upload-screenshot', uploadPaymentScreenshot);
router.get('/track/:id', trackOrder);
router.get('/customer/:email', getOrdersByEmail);
router.get('/detail/:id', getOrderById);

// Protected admin routes
router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id/status', authMiddleware, updateOrderStatus);
router.delete('/bulk', authMiddleware, deleteManyOrders);
router.delete('/:id', authMiddleware, deleteOrder);

export default router;
