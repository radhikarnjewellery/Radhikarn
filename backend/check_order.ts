import mongoose from 'mongoose';
import { Order } from './src/models/Order';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const order = await Order.findOne({ orderId: 'RK20260331YGGE' });
  console.log('Order found:', JSON.stringify(order, null, 2));
  process.exit();
}
check();
