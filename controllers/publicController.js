import mongoose from 'mongoose';

export const crearTenantYAdmin = async (req, res) => {
  try {
    const { nombre, email, documento, password } = req.body;

    if (!nombre || !email || !documento || !password) {
      return res.status(400).json({ message: 'Campos obligatorios faltantes' });
    }

    // ✅ Generar nuevo tenantId (ObjectId válido)
    const tenantId = new mongoose.Types.ObjectId();

    // Verificar si ya existe un admin con ese correo en todo el sistema
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
      tenantId: tenantId.toString() // para que el frontend lo guarde
    });

  } catch (error) {
    console.error('❌ Error al crear tenant y admin:', error.message);
    res.status(500).json({ message: 'Error interno', error: error.message });
  }
};
