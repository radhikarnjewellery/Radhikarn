import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitor extends Document {
  ip: string;
  userEmail?: string;
  userName?: string;
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lng?: number;
  userAgent?: string;
  lastSeen: Date;
  visitCount: number;
  seen: boolean;
  createdAt: Date;
}

const VisitorSchema = new Schema({
  ip: { type: String, required: true },
  userEmail: { type: String },
  userName: { type: String },
  city: { type: String },
  region: { type: String },
  country: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  userAgent: { type: String },
  lastSeen: { type: Date, default: Date.now },
  visitCount: { type: Number, default: 1 },
  seen: { type: Boolean, default: false },
}, { timestamps: true });

export const Visitor = mongoose.model<IVisitor>('Visitor', VisitorSchema);
