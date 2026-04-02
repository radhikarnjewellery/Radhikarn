import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  productId: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  category: string;
  images: string[];
  coverImage: string;
  isNew: boolean;
  stock: number;
  isPopular: boolean;
  ratings: number;
  reviews: number;
}

const ProductSchema: Schema = new Schema({
  productId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  category: { type: String, required: true },
  images: [{ type: String }],
  coverImage: { type: String, required: true },
  isNew: { type: Boolean, default: true },
  stock: { type: Number, default: 10 },
  isPopular: { type: Boolean, default: false },
  ratings: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 }
}, { timestamps: true });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
