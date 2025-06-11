// server.js
import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import mongoose from 'mongoose';
import cors from 'cors';

import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js'; // Asegúrate de tener estas rutas creadas
import connectDB from './config/db.js';
connectDB(); // Llamar antes de app.listen()



// Cargar variables de entorno
dotenv.config();

// Inicializar app
const app = express();

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch((err) => console.error('❌ Error conectando a MongoDB:', err.message));

// Middleware
app.use(cors());
app.use(express.json());

// Documentación Swagger
const swaggerDoc = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Ruta principal
app.use('/api/auth', authRoutes);

// Ruta raíz (test)
app.get('/', (req, res) => res.send('✅ API funcionando 🔐'));

// Ruta de error para pruebas
app.get('/error-test', (req, res, next) => {
  const error = new Error('Este es un error de prueba');
  error.status = 418;
  next(error);
});

// Middleware global de errores
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
