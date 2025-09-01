import express from 'express';
import { crearTenantYAdmin } from '../controllers/publicController.js';

const router = express.Router();

// Ruta libre para crear tenant + primer admin
router.post('/crear-tenant', crearTenantYAdmin);

export default router;
