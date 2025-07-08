import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Roles permitidos (ajusta según tu app)
const rolesValidos = ['admin', 'usuario', 'moderador'];

// Registro de usuario (requiere tenantId)
export const register = async (req, res) => {
  try {
    const { nombre, email, documento, password, rol, tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ message: 'tenantId es obligatorio para el registro' });
    }

    if (!documento) {
      return res.status(400).json({ message: 'El documento es obligatorio para el registro' });
    }

    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const existeEmail = await User.findOne({ email, tenantId });
    if (existeEmail) return res.status(400).json({ message: 'Correo ya registrado en su organización' });

    const existeDoc = await User.findOne({ documento, tenantId });
    if (existeDoc) return res.status(400).json({ message: 'Documento ya registrado en su organización' });

    const hashed = await bcrypt.hash(password, 12); // Mayor seguridad en hash
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

// Inicio de sesión (detecta tenantId automáticamente)
export const login = async (req, res) => {
  try {
    const { documento, password } = req.body;

    if (!documento) {
      return res.status(400).json({ message: 'Debe proporcionar el documento para iniciar sesión' });
    }

    const user = await User.findOne({ documento });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no registrado en ninguna empresa' });
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

// El resto de funciones (profile, getUsers, updateUser, deleteUser, etc.) mantienen igual.
// No olvides proteger tus rutas con middleware que valide token y roles.

