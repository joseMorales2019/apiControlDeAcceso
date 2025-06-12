// routes/authRoutes.js
import express from 'express';
import { register, login, profile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas de autenticación
router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, profile);


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


router.post('/register', register);
router.post('/login', login);
router.get('/profile', profile);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.put('/users', updateManyUsers);
router.delete('/users/:id', deleteUser);
router.delete('/users', deleteManyUsers);


export default router;
