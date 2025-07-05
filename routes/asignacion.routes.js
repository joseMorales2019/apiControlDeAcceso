import express from 'express';
import { asignarFormularioAUsuario } from '../controllers/asignacion.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, isAdmin, asignarFormularioAUsuario);

export default router;
