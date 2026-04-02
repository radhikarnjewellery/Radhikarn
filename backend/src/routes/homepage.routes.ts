import express from 'express';
import { getSettings, updateFeatured, updateSignatureCollections, uploadCollectionImage, deleteCollectionImage } from '../controllers/homepage.controller';

const router = express.Router();

router.get('/', getSettings);
router.put('/featured', updateFeatured);
router.put('/signature', updateSignatureCollections);
router.post('/upload', uploadCollectionImage);
router.post('/delete-image', deleteCollectionImage);

export default router;
