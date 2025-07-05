import mongoose from 'mongoose';

const formularioAsignadoSchema = new mongoose.Schema({
  formularioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Formulario', required: true },
  visible: { type: Boolean, default: true },
  respuestas: [{ etiqueta: String, respuesta: mongoose.Schema.Types.Mixed }]
}, { _id: false });

const userSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  documento: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'usuario'], default: 'usuario' },
  formulariosAsignados: [formularioAsignadoSchema]
}, { timestamps: true });

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, documento: 1 }, { unique: true });

export default mongoose.model('User', userSchema);
