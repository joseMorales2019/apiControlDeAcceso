import xlsx from 'xlsx';
import multer from 'multer';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const importarUsuarios = async (req, res) => {
  const workbook = xlsx.read(req.file.buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  for (const row of rows) {
    const hashed = await bcrypt.hash(row.password, 10);
    await User.create({
      nombre: row.nombre,
      email: row.email,
      documento: row.documento,
      password: hashed,
      rol: row.rol || 'usuario',
    });
  }

  res.json({ message: 'Usuarios importados' });
};
