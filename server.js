// server.js
import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { errorHandler } from './middleware/errorHandler.js';

// Cargar variables de entorno desde .env
dotenv.config();

// Inicializar app
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Documentación Swagger
const swaggerDoc = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Ruta raíz (test)
app.get('/', (req, res) => res.send('✅ API funcionando 🔐'));

// Ejemplo de ruta con error (opcional para pruebas)
app.get('/error-test', (req, res, next) => {
  const error = new Error('Este es un error de prueba');
  error.status = 418;
  next(error); // Se envía al middleware de errores
});

// Middleware global de errores (debe ir al final)
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
