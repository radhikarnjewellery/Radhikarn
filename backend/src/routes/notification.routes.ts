import express from 'express';
import { getNotifications, getActiveNotifications, createNotification, updateNotification, deleteNotification } from '../controllers/notification.controller';

const router = express.Router();

router.get('/', getNotifications);
router.get('/active', getActiveNotifications);
router.post('/', createNotification);
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);

export default router;
