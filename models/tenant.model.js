// 📄 tenant.model.js
i// models/tenant.model.js
import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  tenantId: { type: String, required: true, unique: true },
  plan: { type: String, enum: ['free', 'premium', 'enterprise'], default: 'free' },
  activo: { type: Boolean, default: true },
  creadoEn: { type: Date, default: Date.now }
});

export default mongoose.model('Tenant', tenantSchema);
