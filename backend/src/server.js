// Carregar variáveis de ambiente ANTES de qualquer coisa
const dotenv = require("dotenv");
dotenv.config();

// Inicializar OpenTelemetry (precisa das variáveis de ambiente)
require('./observability/tracer');

const app = require("./app");
const { logger } = require('./observability/logger');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info({
    event: 'server_started',
    port: PORT,
    message: `Servidor rodando em http://localhost:${PORT}`,
  });
});