import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  label?: string;
  latitude?: number;
  longitude?: number;
}

export interface IUser extends Document {
  googleId: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  joinedAt: string;
  addresses: IAddress[];
}

const UserSchema: Schema = new Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  phone: { type: String },
  joinedAt: { type: String, default: () => new Date().toISOString() },
  addresses: [{
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    label: String,
    latitude: Number,
    longitude: Number
  }]
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
