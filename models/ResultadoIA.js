// models/ResultadoIA.js
import mongoose from 'mongoose';

const ResultadoIASchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    datosGenerales: { type: Object, default: {} },
    respuestas:     { type: Array,  default: [] },
    resultado:      { type: Object, default: {} },
    meta:           { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('ResultadoIA', ResultadoIASchema);
