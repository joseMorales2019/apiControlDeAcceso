import User from '../models/user.model.js';
import mongoose from 'mongoose';

export const asignarFormularioAUsuario = async (req, res) => {
  const { userId, formularioId, visible = true } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(formularioId)) {
    return res.status(400).json({ error: 'ID de usuario o formulario inválido' });
  }

  try {
    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verifica si el formulario ya está asignado
    const yaAsignado = usuario.formulariosAsignados.some(
      (f) => f.formularioId.toString() === formularioId
    );

    if (!yaAsignado) {
      usuario.formulariosAsignados.push({ formularioId, visible });
      await usuario.save();
    }

    res.json({ mensaje: '✅ Formulario asignado con éxito', usuario });
  } catch (error) {
    console.error('❌ Error al asignar formulario:', error);
    res.status(500).json({
      error: 'Error al asignar formulario',
      detalle: error.message
    });
  }
};
