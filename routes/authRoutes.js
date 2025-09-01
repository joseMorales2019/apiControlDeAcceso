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
  guardarResultadoIA,              // ⬅️ NUEVO
  listarResultadosIAMios,
  guardarResultadoIA,          // 👈 añade
  getResultadoIAById           // 👈 añade

} from '../controllers/authController.js';

import { importarUsuarios, upload } from '../controllers/excelController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Públicas
router.post('/register', register);
router.post('/login', login);

// Auth básico
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

// ⬇️ NUEVOS ENDPOINTS PARA RESULTADOS DE IA (usuario autenticado)
router.post('/resultados-ia', verifyToken, guardarResultadoIA);
router.get('/resultados-ia/mios', verifyToken, listarResultadosIAMios);

// 👇 NUEVOS endpoints para resultados IA
router.post('/resultados-ia', verifyToken, guardarResultadoIA);
router.get('/resultados-ia/:id', verifyToken, getResultadoIAById);

export default router;
