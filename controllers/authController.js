// controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  try {
    const { nombre, email, documento, password, rol } = req.body;

    const existeEmail = await User.findOne({ email });
    if (existeEmail) return res.status(400).json({ message: 'Correo ya registrado' });

    const existeDoc = await User.findOne({ documento });
    if (existeDoc) return res.status(400).json({ message: 'Documento ya registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const nuevo = await User.create({ nombre, email, documento, password: hashed, rol });

    const token = jwt.sign(
      { id: nuevo._id, rol: nuevo.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('❌ Error en register:', error.message);
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // if (!user || !(await bcrypt.compare(password, user.password))) {
    //   return res.status(400).json({ message: 'Credenciales inválidas' });
    // }

    if (!user || password !== user.password) {
  return res.status(400).json({ message: 'Credenciales inválidas' });
}



    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token, user: { id: user._id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    res.status(500).json({ message: 'Error en inicio de sesión', error: error.message });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    console.error('❌ Error en profile:', error.message);
    res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
  }
};
