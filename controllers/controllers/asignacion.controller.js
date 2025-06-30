import User from '../models/user.model.js';

export const asignarFormularioAUsuario = async (req, res) => {
  const { userId, formularioId } = req.body;
  try {
    const usuario = await User.findById(userId);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (!usuario.formulariosAsignados.includes(formularioId)) {
      usuario.formulariosAsignados.push(formularioId);
      await usuario.save();
    }

    res.json({ mensaje: 'Formulario asignado con éxito', usuario });
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar formulario', detalle: error.message });
  }
};
