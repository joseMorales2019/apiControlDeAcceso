import xlsx from 'xlsx';
import multer from 'multer';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const importarUsuarios = async (req, res) => {
  try {
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
        // ✅ Validar datos básicos
        const { nombre, email, documento, password, rol, eliminar } = row;

        if (!email || !documento) {
          throw new Error(`Fila ${i + 2}: 'email' y 'documento' son obligatorios`);
        }

        const existingUser = await User.findOne({ documento });

        // ✅ Eliminar usuario si se indica eliminar: true
        if (eliminar === true || eliminar === 'true') {
          if (existingUser) {
            await User.deleteOne({ documento });
            deleted++;
          }
          continue;
        }

        // ✅ Preparar contraseña (rehash solo si es nueva)
        let hashedPassword = existingUser?.password;
        if (!existingUser || (password && !(await bcrypt.compare(password, existingUser.password)))) {
          hashedPassword = await bcrypt.hash(password || '12345678', 10);
        }

        if (existingUser) {
          // ✅ Actualizar usuario
          await User.updateOne(
            { documento },
            {
              nombre: nombre || existingUser.nombre,
              email: email || existingUser.email,
              password: hashedPassword,
              rol: rol || existingUser.rol
            }
          );
          updated++;
        } else {
          // ✅ Crear usuario
          await User.create({
            nombre,
            email,
            documento,
            password: hashedPassword,
            rol: rol || 'usuario'
          });
          created++;
        }

      } catch (err) {
        errors.push({ fila: i + 2, error: err.message });
      }
    }

    res.json({
      mensaje: '📦 Procesamiento de Excel completado.',
      resultados: {
        creados: created,
        actualizados: updated,
        eliminados: deleted,
        errores: errors
      }
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error procesando el archivo Excel', error: error.message });
  }
};
