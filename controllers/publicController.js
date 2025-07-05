// controllers/publicController.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const crearTenantYAdmin = async (req, res) => {
  try {
    const { tenantId, nombre, email, documento, password } = req.body;

    if (!tenantId || !email || !password || !documento || !nombre) {
      return res.status(400).json({ message: 'Campos obligatorios faltantes' });
    }

    // Verificar si ya existen usuarios para ese tenant
    const existeAdmin = await User.findOne({ tenantId });
    if (existeAdmin) {
      return res.status(400).json({ message: 'Este tenant ya tiene un administrador registrado' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const nuevo = await User.create({
      tenantId: new mongoose.Types.ObjectId(tenantId), // o solo tenantId si no usas como ObjectId
      nombre,
      email,
      documento,
      password: hashed,
      rol: 'admin'
    });

    const token = jwt.sign(
      { id: nuevo._id, rol: nuevo.rol, tenantId: nuevo.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      mensaje: '✅ Tenant y primer admin creados con éxito',
      token
    });
  } catch (error) {
    console.error('❌ Error al crear tenant y admin:', error.message);
    res.status(500).json({ message: 'Error interno', error: error.message });
  }
};
