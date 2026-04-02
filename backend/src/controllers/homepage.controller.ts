import { Request, Response } from 'express';
import { HomepageSettings } from '../models/HomepageSettings';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await HomepageSettings.findOne();
    if (!settings) settings = await HomepageSettings.create({ featuredProductIds: [], signatureCollections: [] });
    res.json(settings);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const updateSignatureCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await HomepageSettings.findOne();
    if (!settings) settings = await HomepageSettings.create({ featuredProductIds: [], signatureCollections: [] });
    settings.signatureCollections = req.body.collections || [];
    settings.markModified('signatureCollections');
    await settings.save();
    res.json(settings);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const updateFeatured = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await HomepageSettings.findOne();
    if (!settings) settings = await HomepageSettings.create({ featuredProductIds: [], signatureCollections: [] });
    settings.featuredProductIds = req.body.productIds || [];
    settings.markModified('featuredProductIds');
    await settings.save();
    res.json(settings);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const uploadCollectionImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image } = req.body;
    if (!image) { res.status(400).json({ message: 'No image provided' }); return; }
    const result = await cloudinary.v2.uploader.upload(image, { folder: 'rk_signature_collections', quality: 'auto', fetch_format: 'auto' });
    res.json({ url: result.secure_url });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
};

export const deleteCollectionImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) { res.status(400).json({ message: 'No imageUrl provided' }); return; }
    // Extract public_id from Cloudinary URL
    const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (match) {
      await cloudinary.v2.uploader.destroy(match[1]);
    }
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
};
