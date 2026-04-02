import { Request, Response } from 'express';
import { Charge } from '../models/Charge';

export const getCharges = async (req: Request, res: Response): Promise<void> => {
  try {
    const charges = await Charge.find().sort({ createdAt: -1 });
    res.json(charges);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveCharges = async (req: Request, res: Response): Promise<void> => {
  try {
    const charges = await Charge.find({ isActive: true });
    res.json(charges);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCharge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, value, isActive } = req.body;
    const charge = new Charge({ name, type, value, isActive });
    await charge.save();
    res.status(201).json(charge);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCharge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const charge = await Charge.findByIdAndUpdate(id, req.body, { new: true });
    if (!charge) {
      res.status(404).json({ message: 'Charge not found' });
      return;
    }
    res.json(charge);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCharge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const charge = await Charge.findByIdAndDelete(id);
    if (!charge) {
      res.status(404).json({ message: 'Charge not found' });
      return;
    }
    res.json({ message: 'Charge deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
