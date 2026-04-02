import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Admin } from '../models/Admin';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rk_jewellery';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✨ Connected to MongoDB');

    // Clear existing admins
    await Admin.deleteMany({});
    console.log('🧹 Cleared existing admins');

    // Create new admin
    const admin = new Admin({
      username: 'admin',
      password: 'admin' // Will be hashed by pre-save hook
    });

    await admin.save();
    console.log('✅ Admin account created: admin/admin');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
