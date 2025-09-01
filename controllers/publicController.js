import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const crearTenantYAdmin = async (req, res) => {
  try {
    const { nombre, email, documento, password } = req.body;

    if (!nombre || !email || !documento || !password) {
      return res.status(400).json({ message: 'Campos obligatorios faltantes' });
    }

    const tenantId = new mongoose.Types.ObjectId();

    const existeAdmin = await User.findOne({ email, documento });
    if (existeAdmin) {
      return res.status(400).json({ message: 'Ya existe un usuario con este correo o documento' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const nuevo = await User.create({
      tenantId,
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
      token,
      tenantId: tenantId.toString()
    });

  } catch (error) {
    console.error('❌ Error al crear tenant y admin:', error.message);
    res.status(500).json({ message: 'Error interno', error: error.message });
  }
};
