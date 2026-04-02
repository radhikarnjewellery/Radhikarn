import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: Schema.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  items: IOrderItem[];
  subtotal?: number;
  charges?: { name: string; type: string; value: number; amount: number }[];
  couponCode?: string;
  couponDiscount?: number;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PAID' | 'UNPAID';
  paymentScreenshot?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true }
});

const ChargeSchema = new Schema({
  name: { type: String },
  chargeType: { type: String },
  value: { type: Number },
  amount: { type: Number }
}, { _id: false });

const OrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  address: { type: String, required: true },
  latitude: Number,
  longitude: Number,
  items: [OrderItemSchema],
  subtotal: { type: Number },
  charges: { type: Schema.Types.Mixed, default: [] },
  couponCode: { type: String },
  couponDiscount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], default: 'PENDING' },
  paymentStatus: { type: String, enum: ['PAID', 'UNPAID'], default: 'PAID' },
  paymentScreenshot: { type: String, default: '' }
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
