// Configurar variáveis de ambiente antes de qualquer import
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'sqlite::memory:';

module.exports = {};
