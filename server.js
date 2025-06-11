import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerDoc = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
