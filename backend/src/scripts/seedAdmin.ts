import mongoose from 'mongoose';
import { Admin } from '../models/Admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewellery-store';
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const adminExists = await Admin.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin already exists. Updating password...');
      adminExists.password = 'admin'; // Pre-save hook will hash it
      await adminExists.save();
      console.log('Admin updated.');
    } else {
      console.log('Creating admin user...');
      const admin = new Admin({
        username: 'admin',
        password: 'admin'
      });

      await admin.save();
      console.log('Admin user created successfully.');
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
