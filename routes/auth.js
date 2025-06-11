// routes/authRoutes.js
import express from 'express';
import { register, login, profile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas de autenticación
router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, profile);

export default router;
