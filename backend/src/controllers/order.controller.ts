import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadPaymentScreenshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image } = req.body;
    if (!image) { res.status(400).json({ message: 'No image provided' }); return; }
    const result = await cloudinary.v2.uploader.upload(image, {
      folder: 'rk_payment_screenshots',
      quality: 60,
      fetch_format: 'auto',
      transformation: [{ width: 1200, crop: 'limit' }]
    });
    res.json({ url: result.secure_url });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idStr = String(req.params.id);
    let order = null;
    if (idStr.match(/^[a-f\d]{24}$/i)) {
      order = await Order.findById(idStr);
    }
    if (!order) {
      order = await Order.findOne({ orderId: idStr });
    }
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order' });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData = req.body;

    // ── Atomic stock reservation (concurrent-safe) ──────────────────────────
    // For each item, atomically decrement stock only if enough remains.
    // If any item fails, roll back all already-decremented items.
    const reserved: { productId: any; quantity: number }[] = [];
    for (const item of orderData.items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) {
        // Roll back already reserved items
        for (const r of reserved) {
          await Product.findByIdAndUpdate(r.productId, { $inc: { stock: r.quantity } });
        }
        const product = await Product.findById(item.productId);
        const available = product?.stock ?? 0;
        res.status(409).json({
          message: available === 0
            ? `"${item.name}" is out of stock.`
            : `Only ${available} unit(s) of "${item.name}" available.`,
          productId: item.productId,
          available
        });
        return;
      }
      reserved.push({ productId: item.productId, quantity: item.quantity });
    }
    // ────────────────────────────────────────────────────────────────────────
    
    // Generate unique order ID: RK + last 2 digits of year + 6 random digits
    const year = new Date().getFullYear();
    const yearSuffix = year.toString().slice(-2);
    
    let orderId = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!isUnique && attempts < maxAttempts) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
      orderId = `RK${yearSuffix}${randomDigits}`;
      
      const existing = await Order.findOne({ orderId });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      res.status(500).json({ message: 'Failed to generate unique order ID' });
      return;
    }
    
    orderData.orderId = orderId;

    const order = new Order(orderData);
    await order.save();

    // Increment coupon usedCount if a coupon was applied
    if (orderData.couponCode) {
      await (await import('../models/Coupon')).Coupon.findOneAndUpdate(
        { code: orderData.couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    let updatedUser = null;
    // Address Saving Logic
    if (orderData.customerEmail) {
      console.log(`🔍 Attempting to save address for: ${orderData.customerEmail.toLowerCase()}`);
      const user = await User.findOne({ email: new RegExp(`^${orderData.customerEmail}$`, 'i') });
      
      if (user) {
        console.log(`✅ User found: ${user.name}`);
        if (orderData.shippingDetails) {
          const exists = user.addresses.find(a => 
            a.street.toLowerCase().trim() === orderData.shippingDetails.street.toLowerCase().trim() && 
            a.pincode.trim() === orderData.shippingDetails.pincode.trim()
          );
          
          if (!exists) {
            console.log(`🏠 New address detected. Saving to profile...`);
            user.addresses.push(orderData.shippingDetails);
            await user.save();
            updatedUser = user;
          } else {
            console.log(`🏠 Address already exists in profile.`);
            updatedUser = user; // Return current user anyway to ensure frontend has latest
          }
        } else {
          // Fallback comparison for the simple string version
          console.log(`⚠️ Structured shippingDetails missing, falling back to string matching.`);
          const exists = user.addresses.find(a => 
            orderData.address.toLowerCase().includes(a.street.toLowerCase()) && 
            orderData.address.includes(a.pincode)
          );
          
          if (!exists && orderData.address && orderData.address.length > 10) {
            const parts = orderData.address.split(',');
            user.addresses.push({
              street: parts[0]?.trim() || orderData.address,
              city: orderData.shippingDetails?.city || "",
              state: orderData.shippingDetails?.state || "",
              pincode: orderData.shippingDetails?.pincode || "",
              phone: orderData.customerPhone,
              label: user.addresses.length === 0 ? "Default" : "New Address"
            });
            await user.save();
            updatedUser = user;
          }
        }
      } else {
        console.log(`❌ No user found with email: ${orderData.customerEmail}`);
      }
    }

    let userResponse = null;
    if (updatedUser) {
      userResponse = {
        id: updatedUser.googleId,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        joinedAt: updatedUser.joinedAt,
        addresses: updatedUser.addresses || []
      };
    }

    res.status(201).json({ order, updatedUser: userResponse });
  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(500).json({ message: 'Error creating order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const prevOrder = await Order.findById(req.params.id);
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    // Restore stock if cancelling a non-already-cancelled order
    if (order && status === 'CANCELLED' && prevOrder?.status !== 'CANCELLED') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status' });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting order' });
  }
};

export const deleteManyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'No order IDs provided' }); return;
    }
    const result = await Order.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${result.deletedCount} order(s) deleted` });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting orders' });
  }
};

export const trackOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const orderIdToTrack = String(id);
    const isObjectId = orderIdToTrack.match(/^[0-9a-fA-F]{24}$/);
    
    const query = isObjectId 
      ? { $or: [{ orderId: id }, { _id: id }] }
      : { orderId: id };

    const order = await Order.findOne(query);
    
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (err) {
    console.error("❌ Tracking error:", err);
    res.status(500).json({ message: 'Error tracking order' });
  }
};

export const getOrdersByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    const orders = await Order.find({ customerEmail: email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user orders' });
  }
};
