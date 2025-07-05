// routes/public.js
import express from 'express';
import { crearTenantYAdmin } from '../controllers/publicController.js';

const router = express.Router();
router.post('/crear-tenant', crearTenantYAdmin); // Ruta libre (solo para primer admin)

export default router;
