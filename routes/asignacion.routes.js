import express from 'express';
import { asignarFormularioAUsuario } from '../controllers/asignacion.controller.js';
const router = express.Router();

router.post('/', asignarFormularioAUsuario); // Ruta: /api/asignacion

export default router;
