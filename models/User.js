import mongoose from 'mongoose';

const formularioAsignadoSchema = new mongoose.Schema({
  formularioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formulario',
    required: true
  },
  visible: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  documento: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['admin', 'usuario'],
    default: 'usuario'
  },
  formulariosAsignados: [formularioAsignadoSchema]
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema); // Asegúrate de usar U mayúscula
