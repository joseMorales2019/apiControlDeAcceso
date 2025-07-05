import mongoose from 'mongoose';
import User from '../models/User.js';
import Formulario from '../models/Formulario.js';


export const asignarFormularioAUsuario = async (req, res) => {
  const { userId, formularioId, visible = true } = req.body;

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(formularioId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const [usuario, formulario] = await Promise.all([
    User.findOne({ _id: userId, tenantId: req.user.tenantId }),
    Formulario.findOne({ _id: formularioId, tenantId: req.user.tenantId })
  ]);

  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (!formulario) return res.status(404).json({ error: 'Formulario no encontrado en esta organización' });

  if (!usuario.formulariosAsignados.some(f => f.formularioId.equals(formularioId))) {
    usuario.formulariosAsignados.push({ formularioId, visible });
    await usuario.save();
  }

  res.json({ mensaje: '✅ Formulario asignado con éxito', usuario });
};
