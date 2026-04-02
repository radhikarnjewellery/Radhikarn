import { Request, Response } from 'express';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find().sort({ order: 1, createdAt: -1 });
    res.json(notifications);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getActiveNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(notifications);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (error: any) { res.status(400).json({ message: error.message }); }
};

export const updateNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notification) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(notification);
  } catch (error: any) { res.status(400).json({ message: error.message }); }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};
