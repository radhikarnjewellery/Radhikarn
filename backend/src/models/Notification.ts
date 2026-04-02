import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  text: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  text: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
