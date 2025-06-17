import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Registro de usuario
export const register = async (req, res) => {
  try {
    const { nombre, email, documento, password, rol } = req.body;

    const existeEmail = await User.findOne({ email });
    if (existeEmail) return res.status(400).json({ message: ' En el backend se registro Correo ya registrado' });

    const existeDoc = await User.findOne({ documento });
    if (existeDoc) return res.status(400).json({ message: ' En el backend se registro Documento ya registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const nuevo = await User.create({ nombre, email, documento, password: hashed, rol });

    const token = jwt.sign(
      { id: nuevo._id, rol: nuevo.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('❌ En el backend se registro Error en register:', error.message);
    res.status(500).json({ message: ' En el backend se registro Error al registrar usuario', error: error.message });
  }
};

// Inicio de sesión
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        message: ' En el backend se registro Credenciales inválidas',
        inputPassword: password,
        storedHashedPassword: user ? user.password : null
      });
    }

    console.log('🟢  En el backend se registro Acceso concedido', {
      email: user.email,
      inputPassword: password,
      storedHashedPassword: user.password
    });

    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token, user: { id: user._id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (error) {
    console.error('❌  En el backend se registro Error en login:', error.message);
    res.status(500).json({ message: ' En el backend se registro Error en inicio de sesión', error: error.message });
  }
};

// Perfil del usuario
export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: ' En el backend se registro Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    console.error('❌  En el backend se registro Error en profile:', error.message);
    res.status(500).json({ message: ' En el backend se registro Error al obtener el perfil', error: error.message });
  }
};



// 🔍 Obtener y filtrar usuarios (solo admin)
export const getUsers = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: ' En el backend se registro Acceso denegado: solo administradores pueden visualizar usuarios' });
    }

    const filters = {};
    if (req.query.email) filters.email = req.query.email;
    // if (req.query.documento) filters.documento = req.query.documento;
    // if (req.query.rol) filters.rol = req.query.rol;

    const users = await User.find(filters).select('-password');
    res.json(users);
  } catch (error) {
    console.error('❌  En el backend se registro  Error al obtener usuarios:', error.message);
    res.status(500).json({ message: ' En el backend se registro Error al obtener usuarios', error: error.message });
  }
};

//FUNCIONA
//https://apicontroldeacceso.onrender.com/api/auth/users?email=jose@example.com
// 🧑‍🔧 Actualizar un usuario (solo admin)
export const updateUser = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: ' En el backend se registro Acceso denegado: solo administradores pueden actualizar usuarios' });
    }

    const { id } = req.params;
    const datosActualizados = req.body;
    if (datosActualizados.password) {
      datosActualizados.password = await bcrypt.hash(datosActualizados.password, 10);
    }

    const user = await User.findByIdAndUpdate(id, datosActualizados, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: ' En el backend se registro Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    console.error('❌  En el backend se registro Error al actualizar usuario:', error.message);
    res.status(500).json({ message: ' En el backend se registro Error al actualizar usuario', error: error.message });
  }
};

// 🧑‍🔧 Actualizar múltiples usuarios (solo admin)
export const updateManyUsers = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: ' En el backend se registro Acceso denegado: solo administradores pueden actualizar múltiples usuarios' });
    }

    const updates = req.body; // Array de objetos { id, campos a actualizar }
    const results = [];

    for (const item of updates) {
      const { id, ...data } = item;
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      const updated = await User.findByIdAndUpdate(id, data, { new: true }).select('-password');
      if (updated) results.push(updated);
    }

    res.json({ updated: results.length, users: results });
  } catch (error) {
    console.error('❌  En el backend se registro Error en actualización múltiple:', error.message);
    res.status(500).json({ message: ' En el backend se registro Error al actualizar múltiples usuarios', error: error.message });
  }
};

// ❌ Eliminar un usuario (solo admin)
export const deleteUser = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: ' En el backend se registro Acceso denegado: solo administradores pueden eliminar usuarios' });
    }

    const { id } = req.params;
    const eliminado = await User.findByIdAndDelete(id);
    if (!eliminado) return res.status(404).json({ message: ' En el backend se registro Usuario no encontrado' });
    res.json({ message: ' En el backend se registro Usuario eliminado correctamente', id });
  } catch (error) {
    console.error('❌  En el backend se registro Error al eliminar usuario:', error.message);
    res.status(500).json({ message: ' En el backend se registro Error al eliminar usuario', error: error.message });
  }
};

// ❌ Eliminar múltiples usuarios (solo admin)
export const deleteManyUsers = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: ' En el backend se registro Acceso denegado: solo administradores pueden eliminar múltiples usuarios' });
    }

    const { ids } = req.body; // Espera un array de IDs
    const resultado = await User.deleteMany({ _id: { $in: ids } });
    res.json({ message: ' En el backend se registro Usuarios eliminados correctamente', eliminados: resultado.deletedCount });
  } catch (error) {
    console.error('❌  En el backend se registro Error al eliminar múltiples usuarios:', error.message);
    res.status(500).json({ message: ' En el backend se registro Error al eliminar usuarios', error: error.message });
  }
};
