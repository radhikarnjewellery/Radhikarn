import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Order } from '../models/Order';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 0;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * (limit || 0);

    const total = await Product.countDocuments();
    const products = limit > 0
      ? await Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
      : await Product.find().sort({ createdAt: -1 });

    // Aggregate order counts per product
    const orderCounts = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $group: { _id: '$items.productId', orderCount: { $sum: '$items.quantity' } } }
    ]);
    const countMap: Record<string, number> = {};
    for (const row of orderCounts) countMap[String(row._id)] = row.orderCount;

    const enriched = products.map(p => ({
      ...(p.toObject()),
      orderCount: countMap[String(p._id)] || 0
    }));

    res.json(limit > 0 ? { products: enriched, total, page, totalPages: Math.ceil(total / limit) } : enriched);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    let product = null;
    if (id.match(/^[a-f\d]{24}$/i)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ productId: id });
    }
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = { ...req.body };
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files) {
      if (files.coverImage) productData.coverImage = files.coverImage[0].path;
      if (files.images) productData.images = files.images.map(f => f.path);
    }

    if (productData.originalPrice && productData.price) {
      productData.discount = Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100);
    }

    // Generate unique productId: RKP + 8 random hex chars
    let productId = '';
    let isUnique = false;
    while (!isUnique) {
      productId = 'RKP-' + Math.random().toString(16).slice(2, 10).toUpperCase();
      const existing = await Product.findOne({ productId });
      if (!existing) isUnique = true;
    }
    productData.productId = productId;

    const product = new Product(productData);
    await product.save();
    await Category.findOneAndUpdate({ name: product.category }, { $inc: { count: 1 } });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    const productData = { ...req.body };
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files) {
      if (files.coverImage) productData.coverImage = files.coverImage[0].path;
      if (files.images) {
        // Append new images to existing ones
        const existing = oldProduct?.images || [];
        productData.images = [...existing, ...files.images.map(f => f.path)];
      }
    }

    if (productData.originalPrice && productData.price) {
      productData.discount = Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });

    if (oldProduct && oldProduct.category !== product?.category) {
      await Category.findOneAndUpdate({ name: oldProduct.category }, { $inc: { count: -1 } });
      await Category.findOneAndUpdate({ name: product?.category }, { $inc: { count: 1 } });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error updating product' });
  }
};

export const deleteProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    if (!imageUrl) { res.status(400).json({ message: 'imageUrl required' }); return; }

    // Extract Cloudinary public_id from URL
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123456/folder/public_id.ext
    const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (match) {
      const cloudinary = await import('cloudinary');
      cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      await cloudinary.v2.uploader.destroy(match[1]);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $pull: { images: imageUrl } },
      { new: true }
    );

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error deleting image' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      await Category.findOneAndUpdate({ name: product.category }, { $inc: { count: -1 } });
    }
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product' });
  }
};
