import express from 'express';
import { register, login, profile } from '../controllers/authController.js';

import { verifyToken } from '../middleware/auth.js';
const router = express.Router();
const express = require('express');
const menuCtrl = require('../controllers/authController.js');




router.get('/', menuCtrl.login);
router.post('/', menuCtrl.profile);
router.put('/:id', menuCtrl.register);
router.delete('/:id', menuCtrl.delete);


router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, profile);

export default router;
module.exports = router;