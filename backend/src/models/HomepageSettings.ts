import mongoose, { Schema, Document } from 'mongoose';

export interface IHomepageSettings extends Document {
  featuredProductIds: string[];
  signatureCollections: {
    name: string;
    tag: string;
    image: string;
    url: string;
    gridPosition: number; // 0-3
  }[];
}

const SignatureSchema = new Schema({
  name: { type: String, default: '' },
  tag: { type: String, default: '' },
  image: { type: String, default: '' },
  url: { type: String, default: '/shop' },
  gridPosition: { type: Number, default: 0 }
});

const HomepageSettingsSchema: Schema = new Schema({
  featuredProductIds: [{ type: String }],
  signatureCollections: [SignatureSchema]
}, { timestamps: true });

export const HomepageSettings = mongoose.model<IHomepageSettings>('HomepageSettings', HomepageSettingsSchema);
