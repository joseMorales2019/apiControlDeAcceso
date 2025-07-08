import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const rolesValidos = ['admin', 'usuario', 'moderador'];

// Elimina múltiples usuarios por array de documentos
export const deleteManyUsers = async (req, res) => {
  try {
    const documentos = req.body; // espera un array de documentos

    if (!Array.isArray(documentos) || documentos.length === 0) {
      return res.status(400).json({ message: 'Lista de documentos vacía o inválida' });
    }

    const resultado = await User.deleteMany({ documento: { $in: documentos } });

    res.json({ message: `${resultado.deletedCount} usuarios eliminados` });
  } catch (error) {
    console.error('❌ Error al eliminar usuarios:', error.message);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Actualiza formularios asignados a un usuario (parámetro id en URL)
export const actualizarFormulariosAsignados = async (req, res) => {
  try {
    const { id } = req.params;  // Corregido para coincidir con ruta
    const { formulariosAsignados } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { formulariosAsignados },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Formularios asignados actualizados', user });
  } catch (error) {
    console.error('❌ Error al actualizar formularios asignados:', error.message);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Registro de usuario con validaciones y hash seguro
export const register = async (req, res) => {
  try {
    const { nombre, email, documento, password, rol, tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ message: 'tenantId es obligatorio para el registro' });
    }

    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' });
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

    res.status(201).json({
      token,
      user: {
        id: nuevo._id,
        nombre: nuevo.nombre,
        email: nuevo.email,
        documento: nuevo.documento,
        rol: nuevo.rol,
        tenantId: nuevo.tenantId
      }
    });
  } catch (error) {
    console.error('❌ Error en register:', error.message);
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

// Inicio de sesión con documento y contraseña
export const login = async (req, res) => {
  try {
    const { documento, password } = req.body;

    if (!documento || !password) {
      return res.status(400).json({ message: 'Documento y contraseña son requeridos' });
    }

    const user = await User.findOne({ documento });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no registrado' });
    }

    const passwordValida = await bcrypt.compare(password, user.password);
    if (!passwordValida) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

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
// Eliminar un usuario por id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error.message);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
