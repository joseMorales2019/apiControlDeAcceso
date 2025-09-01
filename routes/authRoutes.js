// routes/auth.routes.js
import express from 'express';
import {
  register,
  login,
  profile,
  getUsers,
  updateUser,
  updateManyUsers,
  deleteUser,
  deleteManyUsers,
  actualizarFormulariosAsignados,
  guardarResultadoIA,
  getResultadoIAById,
  getResultadoIAPublic,     // ⬅️ NUEVO
} from '../controllers/authController.js';

import { importarUsuarios, upload } from '../controllers/excelController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/* ===== RUTAS PÚBLICAS (sin token) ===== */
router.post('/register', register);
router.post('/login', login);
router.get('/public/resultados-ia/:id', getResultadoIAPublic); // ⬅️ público para enlaces/QR

/* ===== RUTAS PROTEGIDAS ===== */
router.get('/profile', verifyToken, profile);

// Importar usuarios (admin)
router.post('/importar-usuarios', verifyToken, isAdmin, upload.single('file'), importarUsuarios);

// Admin users
router.get('/users', verifyToken, isAdmin, getUsers);
router.put('/users/:id', verifyToken, isAdmin, updateUser);
router.put('/users', verifyToken, isAdmin, updateManyUsers);
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);
router.delete('/users', verifyToken, isAdmin, deleteManyUsers);

// Formularios asignados (admin)
router.put('/users/:id/formularios-asignados', verifyToken, isAdmin, actualizarFormulariosAsignados);

// Resultados IA (privados)
router.post('/resultados-ia', verifyToken, guardarResultadoIA);
router.get('/resultados-ia/:id', verifyToken, getResultadoIAById);

export default router;
