import { Request, Response } from 'express';
import { User } from '../models/User';

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, addressId, addressData } = req.body;
    console.log(`🏠 Updating address ${addressId} for user: ${userId}`);
    
    const user = await User.findOne({ googleId: userId });
    
    if (!user) {
      console.log(`❌ User not found while updating address: ${userId}`);
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const addressIdx = user.addresses.findIndex((a: any) => (a._id || a.id).toString() === addressId);
    
    if (addressIdx === -1) {
      console.log(`❌ Address document not found: ${addressId}`);
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    // Apply updates manually to ensure Mongoose detects change
    user.addresses[addressIdx] = { ...(user.addresses[addressIdx] as any), ...addressData };
    user.markModified('addresses');
    await user.save();
    console.log(`✅ Address updated successfully.`);

    res.json({ message: 'Address updated successfully', user });
  } catch (err) {
    console.error(`❌ Error updating address:`, err);
    res.status(500).json({ message: 'Error updating address' });
  }
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, addressId } = req.body;
    const user = await User.findOne({ googleId: userId });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.addresses = user.addresses.filter((a: any) => a._id.toString() !== addressId);
    await user.save();

    res.json({ message: 'Address deleted successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting address' });
  }
};

export const addAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, addressData } = req.body;
    console.log(`🏠 Adding new address for user: ${userId}`);
    
    const user = await User.findOne({ googleId: userId });
    
    if (!user) {
      console.log(`❌ User not found while adding address: ${userId}`);
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Clean data
    const cleanedAddress = {
      ...addressData,
      label: addressData.label?.trim() || "Address"
    };

    user.addresses.push(cleanedAddress);
    await user.save();
    console.log(`✅ Address added successfully. Total: ${user.addresses.length}`);

    res.json({ message: 'Address added successfully', user });
  } catch (err) {
    console.error(`❌ Error adding address:`, err);
    res.status(500).json({ message: 'Error adding address' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, name, phone, avatar } = req.body;
    const user = await User.findOne({ googleId: userId });
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    if (name) user.name = name;
    if (phone !== undefined) (user as any).phone = phone;
    if (avatar) user.avatar = avatar;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

export const getAllUsersWithStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Order } = await import('../models/Order');
    const users = await User.find().sort({ createdAt: -1 });
    const orders = await Order.find({}, { customerEmail: 1, totalAmount: 1, status: 1 });

    const statsMap: Record<string, { orderCount: number; totalSpent: number }> = {};
    for (const order of orders) {
      const email = order.customerEmail?.toLowerCase();
      if (!email) continue;
      if (!statsMap[email]) statsMap[email] = { orderCount: 0, totalSpent: 0 };
      statsMap[email].orderCount++;
      statsMap[email].totalSpent += order.totalAmount || 0;
    }

    const result = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      phone: (u as any).phone || null,
      joinedAt: u.joinedAt,
      addresses: u.addresses || [],
      addressCount: u.addresses?.length || 0,
      orderCount: statsMap[u.email?.toLowerCase()]?.orderCount || 0,
      totalSpent: statsMap[u.email?.toLowerCase()]?.totalSpent || 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // mongo _id
    const user = await User.findByIdAndDelete(id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }

    // Delete all orders placed by this user
    const { Order } = await import('../models/Order');
    await Order.deleteMany({ customerEmail: new RegExp(`^${user.email}$`, 'i') });

    res.json({ message: 'User and all associated data deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image } = req.body; // base64 data URL
    if (!image) { res.status(400).json({ message: 'No image provided' }); return; }

    const cloudinary = await import('cloudinary');
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.v2.uploader.upload(image, {
      folder: 'radhikarn/avatars',
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
    });

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Avatar upload failed:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
};
