// routes/authRoutes.js
import express from 'express';
import {
  register,
  login,
  profile,
  getUsers,
  updateUser,
  updateManyUsers,
  deleteUser,
  deleteManyUsers
} from '../controllers/authController.js';

import { verifyToken, isAdmin } from '../middleware/auth.js'; // ✅ Importación agregada

const router = express.Router();

// ✅ Rutas públicas
router.post('/register', register);
router.post('/login', login);

// ✅ Ruta protegida para usuario autenticado
router.get('/profile', verifyToken, profile);

// ✅ Rutas protegidas para administrador
router.get('/users', verifyToken, isAdmin, getUsers);
router.put('/users/:id', verifyToken, isAdmin, updateUser);
router.put('/users', verifyToken, isAdmin, updateManyUsers);
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);
router.delete('/users', verifyToken, isAdmin, deleteManyUsers);

export default router;
