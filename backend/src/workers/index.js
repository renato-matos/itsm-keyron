// Carregar variáveis de ambiente ANTES de qualquer coisa
const dotenv = require("dotenv");
dotenv.config();

const rabbitmqClient = require('../config/rabbitmq');
const notificationWorker = require('./notificationWorker');

async function startWorkers() {
  try {
    console.log('Conectando ao RabbitMQ...');
    await rabbitmqClient.connect();
    
    console.log('Iniciando workers...');
    await Promise.all([
      notificationWorker.start()
    ]);
    
    console.log('Todos os workers iniciados com sucesso!');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Encerrando workers...');
      await rabbitmqClient.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Erro ao iniciar workers:', error);
    process.exit(1);
  }
}

startWorkers();