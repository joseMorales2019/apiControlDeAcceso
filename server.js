// server.js
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();

// Swagger setup
const swaggerDoc = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Middleware y rutas (ejemplo)
app.use(express.json());
app.get('/', (req, res) => res.send('API funcionando 🔐'));

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
