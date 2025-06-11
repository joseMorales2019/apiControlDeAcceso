import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  const { nombre, email, documento, password } = req.body;
  const existe = await User.findOne({ documento });
  if (existe) return res.status(400).json({ message: 'Documento ya registrado' });

  const hashed = await bcrypt.hash(password, 10);
  const nuevo = await User.create({ nombre, email, documento, password: hashed });
  const token = jwt.sign({ id: nuevo._id, rol: nuevo.rol }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  res.json({ token });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  res.json({ token, user });
};

export const profile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};
