import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import AnalisisIA from '../models/AnalisisIA.js'; // ⬅️ NUEVO MODELO

// Registro
export const register = async (req, res) => {
  try {
    const { nombre, email, documento, password, rol, tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ message: 'tenantId es obligatorio para el registro' });
    }

    const existeEmail = await User.findOne({ email, tenantId });
    if (existeEmail) return res.status(400).json({ message: 'Correo ya registrado en su organización' });

    const existeDoc = await User.findOne({ documento, tenantId });
    if (existeDoc) return res.status(400).json({ message: 'Documento ya registrado en su organización' });

    const hashed = await bcrypt.hash(password, 10);
    const nuevo = await User.create({ nombre, email, documento, password: hashed, rol, tenantId });

    const token = jwt.sign(
      { id: nuevo._id, rol: nuevo.rol, tenantId: nuevo.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('❌ Error en register:', error.message);
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { documento, password } = req.body;

    if (!documento || !password) {
      return res.status(400).json({ message: 'Documento y contraseña son requeridos' });
    }

    const user = await User.findOne({ documento });
    if (!user) return res.status(404).json({ message: 'Usuario no registrado' });

    const passwordValida = await bcrypt.compare(password, user.password);
    if (!passwordValida) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user._id, rol: user.rol, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        documento: user.documento,
        rol: user.rol,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    res.status(500).json({ message: 'Error en inicio de sesión', error: error.message });
  }
};

// Perfil
export const profile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id, tenantId: req.user.tenantId }).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    console.error('❌ Error en profile:', error.message);
    res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
  }
};

// Admin: listar usuarios
export const getUsers = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado: solo administradores pueden visualizar usuarios' });
    }

    const filters = { tenantId: req.user.tenantId };
    if (req.query.email) filters.email = req.query.email;

    const users = await User.find(filters).select('-password');
    res.json(users);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error.message);
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

// Admin: actualizar un usuario
export const updateUser = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado: solo administradores pueden actualizar usuarios' });
    }

    const { id } = req.params;
    const datosActualizados = req.body;

    if (datosActualizados.password) {
      datosActualizados.password = await bcrypt.hash(datosActualizados.password, 10);
    }

    const user = await User.findOneAndUpdate(
      { _id: id, tenantId: req.user.tenantId },
      datosActualizados,
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error.message);
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

// Admin: actualizar múltiples
export const updateManyUsers = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado: solo administradores pueden actualizar múltiples usuarios' });
    }

    const updates = req.body;

    const updatePromises = updates.map(async (item) => {
      const { id, ...data } = item;

      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      return User.findOneAndUpdate(
        { _id: id, tenantId: req.user.tenantId },
        data,
        { new: true }
      ).select('-password');
    });

    const results = await Promise.all(updatePromises);
    const updatedUsers = results.filter(Boolean);

    res.json({ updated: updatedUsers.length, users: updatedUsers });
  } catch (error) {
    console.error('❌ Error en actualización múltiple:', error.message);
    res.status(500).json({ message: 'Error al actualizar múltiples usuarios', error: error.message });
  }
};

// Admin: eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado: solo administradores pueden eliminar usuarios' });
    }

    const { id } = req.params;
    const eliminado = await User.findOneAndDelete({ _id: id, tenantId: req.user.tenantId });
    if (!eliminado) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({ message: 'Usuario eliminado correctamente', id });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error.message);
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

// Admin: eliminar múltiples
export const deleteManyUsers = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado: solo administradores pueden eliminar múltiples usuarios' });
    }

    const { ids } = req.body;
    const resultado = await User.deleteMany({ _id: { $in: ids }, tenantId: req.user.tenantId });

    res.json({ message: 'Usuarios eliminados correctamente', eliminados: resultado.deletedCount });
  } catch (error) {
    console.error('❌ Error al eliminar múltiples usuarios:', error.message);
    res.status(500).json({ message: 'Error al eliminar usuarios', error: error.message });
  }
};

// Admin: actualizar formularios asignados
export const actualizarFormulariosAsignados = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores pueden actualizar formularios asignados' });
    }

    const userId = req.params.id;
    const { formulariosAsignados } = req.body;

    const usuario = await User.findOneAndUpdate(
      { _id: userId, tenantId: req.user.tenantId },
      { formulariosAsignados },
      { new: true }
    ).select('-password');

    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.json({
      mensaje: 'Formularios asignados actualizados con éxito',
      usuario
    });
  } catch (err) {
    console.error('❌ Error al actualizar formularios asignados:', err.message);
    res.status(500).json({ mensaje: 'Error al actualizar formularios asignados' });
  }
};

/* ===================== NUEVO: Guardar Resultados IA ===================== */
export const guardarResultadoIA = async (req, res) => {
  try {
    // Todo viene del body; la identidad real del usuario/tenant viene del token
    const { usuario, datosGenerales, respuestas, resultado, meta } = req.body;

    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({ message: 'Token inválido o incompleto' });
    }

    // Snapshot mínimo del usuario (si no viene en body)
    let usuarioLoginSnapshot = usuario;
    if (!usuarioLoginSnapshot) {
      const u = await User.findOne({ _id: userId, tenantId }).select('nombre email documento rol');
      usuarioLoginSnapshot = u ? {
        id: u._id,
        nombre: u.nombre,
        email: u.email,
        documento: u.documento,
        rol: u.rol
      } : {};
    }

    const doc = await AnalisisIA.create({
      tenantId,
      userId,
      usuarioLoginSnapshot,
      datosGenerales: datosGenerales || {},
      respuestas: Array.isArray(respuestas) ? respuestas : [],
      resultado: resultado || {},
      meta: {
        ...meta,
        origen: meta?.origen || 'BFQ-UI',
        version: meta?.version || 1
      }
    });

    res.status(201).json({
      message: '✅ Resultado de IA guardado correctamente',
      id: doc._id
    });
  } catch (error) {
    console.error('❌ Error al guardar resultado IA:', error);
    res.status(500).json({ message: 'Error al guardar resultado IA', error: error.message });
  }
};

// (Opcional) Listar resultados del usuario actual
export const listarResultadosIAMios = async (req, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    const docs = await AnalisisIA.find({ userId, tenantId }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    console.error('❌ Error al listar resultados IA:', error);
    res.status(500).json({ message: 'Error al listar resultados IA' });
  }
};
