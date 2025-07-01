// server.js

// 🌐 Core modules y configuración base
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// 🛠️ Middlewares y configuración
import { errorHandler } from './middleware/errorHandler.js';
import connectDB from './config/db.js';

// 📦 Rutas
import authRoutes from './routes/authRoutes.js';
import asignacionRoutes from './routes/asignacion.routes.js'; // ✔️ Debe ir después de la configuración base

// 📄 Cargar variables de entorno
dotenv.config();

// 🛠️ Inicializar aplicación
const app = express();

// 🔌 Conexión a base de datos
connectDB(); // Conexión personalizada, recomendada
// O, si prefieres usar directamente mongoose:
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('✅ Conectado a MongoDB'))
//   .catch((err) => console.error('❌ Error conectando a MongoDB:', err.message));

// 🌍 Middleware base
app.use(cors());
app.use(express.json());

// 📚 Documentación Swagger
const swaggerDoc = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// 🚦 Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/asignacion', asignacionRoutes); // Ruta protegida para asignaciones

// 🏁 Ruta raíz (ping de estado)
app.get('/', (req, res) => res.send('✅ API funcionando 🔐'));

// ❌ Ruta para pruebas de errores
app.get('/error-test', (req, res, next) => {
  const error = new Error('Este es un error de prueba');
  error.status = 418; // Teapot error (Easter egg)
  next(error);
});

// 🧯 Middleware global para manejo de errores
app.use(errorHandler);

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
