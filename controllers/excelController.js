import xlsx from 'xlsx';
import multer from 'multer';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const importarUsuarios = async (req, res) => {
  try {
    const tenantId = req.user.tenantId; // Forzar tenantId del usuario autenticado
    if (!tenantId) {
      return res.status(400).json({ message: 'tenantId no encontrado en token' });
    }

    const workbook = xlsx.read(req.file.buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    let created = 0;
    let updated = 0;
    let deleted = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const { nombre, email, documento, password, rol, eliminar } = row;

        if (!email || !documento) {
          throw new Error(`Fila ${i + 2}: 'email' y 'documento' son obligatorios`);
        }

        // Buscar usuario solo en tenant actual
        const existingUser = await User.findOne({ documento, tenantId });

        if (eliminar === true || eliminar === 'true') {
          if (existingUser) {
            await User.deleteOne({ documento, tenantId });
            deleted++;
          }
          continue;
        }

        // Validar duplicados explícitamente (email y documento)
        const emailConflict = await User.findOne({ email, tenantId, documento: { $ne: documento } });
        if (emailConflict) throw new Error(`Fila ${i + 2}: Email ya registrado en otro usuario`);

        let hashedPassword = existingUser?.password;

        if (!existingUser || (password && !(await bcrypt.compare(password, existingUser.password)))) {
          hashedPassword = await bcrypt.hash(password || '12345678', 10);
        }

        if (existingUser) {
          // Actualizar usuario
          await User.updateOne(
            { documento, tenantId },
            {
              nombre: nombre || existingUser.nombre,
              email: email || existingUser.email,
              password: hashedPassword,
              rol: rol || existingUser.rol,
              tenantId // asegurar que no se cambie tenant
            }
          );
          updated++;
        } else {
          // Crear usuario nuevo
          await User.create({
            nombre,
            email,
            documento,
            password: hashedPassword,
            rol: rol || 'usuario',
            tenantId
          });
          created++;
        }
      } catch (err) {
        errors.push({ fila: i + 2, error: err.message });
      }
    }

    res.json({
      mensaje: 'Procesamiento de Excel completado.',
      resultados: { creados: created, actualizados: updated, eliminados: deleted, errores: errors }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error procesando el archivo Excel', error: error.message });
  }
};
