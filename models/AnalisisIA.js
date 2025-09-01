import mongoose from 'mongoose';

const { Schema } = mongoose;

const AnalisisIASchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  userId:   { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },

  // Snapshot del usuario logueado al momento de guardar (no sensible)
  usuarioLoginSnapshot: {
    id: { type: Schema.Types.ObjectId },
    nombre: String,
    email: String,
    documento: String,
    rol: String
  },

  // Datos del test
  datosGenerales: Schema.Types.Mixed,   // { fechaPrueba, edad, sexo, testAplicado, escalaNormativa }
  respuestas:    [Schema.Types.Mixed],  // array de respuestas BFQ
  resultado:     Schema.Types.Mixed,    // objeto normalizado devuelto por IA

  meta: {
    origen:   { type: String, default: 'BFQ-UI' },
    version:  { type: Number, default: 1 },
    creadoEn: { type: Date }
  }
}, { timestamps: true });

AnalisisIASchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

export default mongoose.model('AnalisisIA', AnalisisIASchema);
