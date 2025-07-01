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
  actualizarFormulariosAsignados // ✅ Nueva función controladora
} from '../controllers/authController.js';

import { importarUsuarios, upload } from '../controllers/excelController.js';

import { verifyToken, isAdmin } from '../middleware/auth.js'; // ✅ Middleware para autenticación y autorización

const router = express.Router();

// ✅ Rutas públicas
router.post('/register', register);
router.post('/login', login);

// ✅ Ruta protegida para usuario autenticado
router.get('/profile', verifyToken, profile);

// ✅ Importar usuarios desde archivo Excel
router.post('/importar-usuarios', verifyToken, isAdmin, upload.single('file'), importarUsuarios);

// ✅ Rutas protegidas para administrador
router.get('/users', verifyToken, isAdmin, getUsers);
router.put('/users/:id', verifyToken, isAdmin, updateUser);
router.put('/users', verifyToken, isAdmin, updateManyUsers);
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);
router.delete('/users', verifyToken, isAdmin, deleteManyUsers);

// ✅ NUEVA RUTA: Actualizar formularios asignados de un usuario
router.put('/users/:id/formularios-asignados', verifyToken, actualizarFormulariosAsignados);

export default router;
