import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find();
    const products = await Product.find();
    const categories = await Category.find();

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    
    // Count unique customers by email
    const uniqueCustomers = new Set(orders.map(o => o.customerEmail)).size;

    // Last 5 orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    // Distribution by category
    const categoryStats = categories.map(cat => ({
      name: cat.name,
      count: products.filter(p => p.category === cat.name).length
    }));

    // Daily revenue for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Daily revenue for the last 7 days (Chonological)
    const dailyRevData = orders
      .filter(o => new Date(o.createdAt) >= sevenDaysAgo)
      .reduce((acc: any, order) => {
        const day = new Date(order.createdAt).toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + order.totalAmount;
        return acc;
      }, {});

    const chartData = Object.keys(dailyRevData)
      .sort()
      .map(dateStr => ({
        name: new Date(dateStr).toLocaleDateString('default', { day: '2-digit', month: 'short' }),
        total: dailyRevData[dateStr]
      }));

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      uniqueCustomers,
      recentOrders,
      categoryStats,
      chartData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

import mongoose from 'mongoose';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getPlatformHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = process.hrtime();

    // MongoDB status & latency
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'up' : 'down';
    let dbLatency = 0;
    let dbStats = { dataSize: 0, storageSize: 0, collections: 0, indexes: 0, objects: 0 };
    try {
      const t = Date.now();
      await mongoose.connection.db!.admin().ping();
      dbLatency = Date.now() - t;
      const stats = await mongoose.connection.db!.stats();
      dbStats = {
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        collections: stats.collections,
        indexes: stats.indexes,
        objects: stats.objects
      };
    } catch {}

    // Cloudinary usage — try both usage() and resources()
    // Free tier: 25 GB storage (25 * 1024 * 1024 * 1024 bytes)
    const cloudinaryFreeLimit = 25 * 1024 * 1024 * 1024;
    let cloudinaryUsage = { usedBytes: 0, limitBytes: cloudinaryFreeLimit, usedPercent: 0, totalResources: 0, plan: '' };
    try {
      const usage = await cloudinary.v2.api.usage();
      const usedBytes = usage.storage?.usage ?? 0;
      const limitBytes = usage.storage?.limit ?? cloudinaryFreeLimit;
      const usedPercent = limitBytes > 0 ? (usedBytes / limitBytes) * 100 : 0;
      cloudinaryUsage = {
        usedBytes,
        limitBytes,
        usedPercent: parseFloat(usedPercent.toFixed(2)),
        totalResources: usage.resources ?? 0,
        plan: usage.plan ?? 'free'
      };
    } catch (e) { console.error('Cloudinary usage error:', e); }

    // Server uptime & memory
    const uptimeSeconds = process.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMins = Math.floor((uptimeSeconds % 3600) / 60);
    const mem = process.memoryUsage();
    const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
    const heapPercent = parseFloat(((heapUsedMB / heapTotalMB) * 100).toFixed(1));

    // Order stats
    const [totalOrders, pendingOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'PENDING' }),
      Order.countDocuments({ status: 'PROCESSING' }),
      Order.countDocuments({ status: 'SHIPPED' }),
      Order.countDocuments({ status: 'DELIVERED' }),
      Order.countDocuments({ status: 'CANCELLED' }),
    ]);

    const [s, ns] = process.hrtime(startTime);
    const responseTime = Math.round(s * 1000 + ns / 1e6);

    // MongoDB storage percent (Atlas free tier = 512MB)
    const mongoLimitBytes = 512 * 1024 * 1024;
    const mongoUsedPercent = parseFloat(((dbStats.storageSize / mongoLimitBytes) * 100).toFixed(2));

    res.json({
      backend: { status: 'up', responseTime, uptime: `${uptimeHours}h ${uptimeMins}m`, uptimeSeconds, nodeVersion: process.version, platform: process.platform },
      database: { status: dbStatus, latency: dbLatency, usedPercent: mongoUsedPercent, ...dbStats },
      cloudinary: cloudinaryUsage,
      memory: { heapUsed: heapUsedMB, heapTotal: heapTotalMB, heapPercent, rss: Math.round(mem.rss / 1024 / 1024) },
      orders: { total: totalOrders, pending: pendingOrders, processing: processingOrders, shipped: shippedOrders, delivered: deliveredOrders, cancelled: cancelledOrders },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
