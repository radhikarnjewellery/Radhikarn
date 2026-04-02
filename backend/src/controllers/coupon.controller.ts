import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';

export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderValue } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      res.status(404).json({ message: 'Invalid coupon code' });
      return;
    }
    
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      res.status(400).json({ message: 'Coupon has expired' });
      return;
    }
    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ message: 'Coupon usage limit reached' });
      return;
    }
    
    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      res.status(400).json({ message: `Minimum order value ₹${coupon.minOrderValue} required` });
      return;
    }
    
    let discount = 0;
    if (coupon.type === 'fixed') {
      discount = coupon.value;
    } else {
      discount = (orderValue * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }
    
    res.json({ valid: true, discount, coupon });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }
    res.json(coupon);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }
    res.json({ message: 'Coupon deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
