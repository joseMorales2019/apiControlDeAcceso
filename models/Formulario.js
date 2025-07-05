// 📁 src/models/Formulario.js
import mongoose from 'mongoose';

const campoSchema = new mongoose.Schema({
  clave: { type: String, required: true },       // nombre técnico del campo
  etiqueta: { type: String, required: true },     // texto visible para el usuario
  tipo: { type: String, default: 'texto' },       // texto | número | fecha | booleano | lista
  obligatorio: { type: Boolean, default: false },
  opciones: [String],                             // solo si es de tipo lista
  orden: { type: Number, default: 0 }
}, { _id: false });

const formularioSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String },
  campos: [campoSchema],
  tenantId: { type: String, required: true },      // multitenancy
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  activo: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Formulario = mongoose.model('Formulario', formularioSchema);
export default Formulario;
