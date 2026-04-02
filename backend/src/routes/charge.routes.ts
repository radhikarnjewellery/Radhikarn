import express from 'express';
import { getCharges, getActiveCharges, createCharge, updateCharge, deleteCharge } from '../controllers/charge.controller';

const router = express.Router();

router.get('/', getCharges);
router.get('/active', getActiveCharges);
router.post('/', createCharge);
router.put('/:id', updateCharge);
router.delete('/:id', deleteCharge);

export default router;
