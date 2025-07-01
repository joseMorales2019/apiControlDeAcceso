import express from 'express';
import { asignarFormularioAUsuario } from '../controllers/asignacion.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.js'; // Asegúrate de usar el path correcto

const router = express.Router();

// Ruta protegida con autenticación y verificación de admin
router.post('/', verifyToken, isAdmin, asignarFormularioAUsuario); // POST /api/asignacion

export default router;
