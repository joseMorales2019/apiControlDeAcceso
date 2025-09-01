// models/AnalisisIA.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const AnalisisIASchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  userId:   { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
  usuarioLoginSnapshot: {
    id: { type: Schema.Types.ObjectId },
    nombre: String,
    email: String,
    documento: String,
    rol: String
  },
  datosGenerales: Schema.Types.Mixed,
  respuestas:    [Schema.Types.Mixed],
  resultado:     Schema.Types.Mixed,
  meta: {
    origen:   { type: String, default: 'BFQ-UI' },
    version:  { type: Number, default: 1 },
    creadoEn: { type: Date }
  }
}, { timestamps: true });

AnalisisIASchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

export default mongoose.model('AnalisisIA', AnalisisIASchema);
