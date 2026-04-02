import mongoose, { Schema, Document } from 'mongoose';

export interface ICharge extends Document {
  name: string;
  type: 'fixed' | 'percentage';
  value: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChargeSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['fixed', 'percentage'], required: true },
  value: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Charge = mongoose.model<ICharge>('Charge', ChargeSchema);
