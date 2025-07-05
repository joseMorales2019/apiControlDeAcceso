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
  actualizarFormulariosAsignados
} from '../controllers/authController.js';

import { importarUsuarios, upload } from '../controllers/excelController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (register y login esperan tenantId en body)
router.post('/register', register);
router.post('/login', login);

// Ruta protegida para usuario autenticado
router.get('/profile', verifyToken, profile);

// Importar usuarios (solo admin)
router.post('/importar-usuarios', verifyToken, isAdmin, upload.single('file'), importarUsuarios);

// Rutas admin
router.get('/users', verifyToken, isAdmin, getUsers);
router.put('/users/:id', verifyToken, isAdmin, updateUser);
router.put('/users', verifyToken, isAdmin, updateManyUsers);
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);
router.delete('/users', verifyToken, isAdmin, deleteManyUsers);

// Actualizar formularios asignados
router.put('/users/:id/formularios-asignados', verifyToken, isAdmin, actualizarFormulariosAsignados);

export default router;
