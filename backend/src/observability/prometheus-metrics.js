const client = require('prom-client');

// Criar um registro padrão
const register = new client.Registry();

// Adicionar métricas padrão do Node.js
client.collectDefaultMetrics({ register });

// Criar métricas customizadas
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

const httpErrorCounter = new client.Counter({
  name: 'http_errors_total',
  help: 'Total de erros HTTP',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

const databaseOperationCounter = new client.Counter({
  name: 'database_operations_total',
  help: 'Total de operações de banco de dados',
  labelNames: ['operation', 'table', 'status'],
  registers: [register],
});

const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duração das queries do banco de dados em segundos',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

const cacheHitCounter = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total de cache hits',
  labelNames: ['cache_key'],
  registers: [register],
});

const cacheMissCounter = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total de cache misses',
  labelNames: ['cache_key'],
  registers: [register],
});

const cacheOperationDuration = new client.Histogram({
  name: 'cache_operation_duration_seconds',
  help: 'Duração das operações de cache em segundos',
  labelNames: ['operation', 'cache_key'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1],
  registers: [register],
});

// Funções para registrar métricas
const recordHttpRequest = (method, path, statusCode, durationMs) => {
  const durationSeconds = durationMs / 1000;
  
  httpRequestCounter.inc({
    method,
    path,
    status: statusCode,
  });

  httpRequestDuration.observe(
    {
      method,
      path,
      status: statusCode,
    },
    durationSeconds
  );

  if (statusCode >= 400) {
    httpErrorCounter.inc({
      method,
      path,
      status: statusCode,
    });
  }
};

const recordDatabaseOperation = (operation, table, durationMs, success = true) => {
  const durationSeconds = durationMs / 1000;

  databaseOperationCounter.inc({
    operation,
    table,
    status: success ? 'success' : 'error',
  });

  databaseQueryDuration.observe(
    {
      operation,
      table,
    },
    durationSeconds
  );
};

const recordCacheHit = (cacheKey) => {
  cacheHitCounter.inc({
    cache_key: cacheKey,
  });
};

const recordCacheMiss = (cacheKey) => {
  cacheMissCounter.inc({
    cache_key: cacheKey,
  });
};

const recordCacheOperation = (operation, cacheKey, durationMs) => {
  const durationSeconds = durationMs / 1000;

  cacheOperationDuration.observe(
    {
      operation,
      cache_key: cacheKey,
    },
    durationSeconds
  );
};

module.exports = {
  register,
  httpRequestCounter,
  httpErrorCounter,
  databaseOperationCounter,
  httpRequestDuration,
  databaseQueryDuration,
  cacheHitCounter,
  cacheMissCounter,
  cacheOperationDuration,
  recordHttpRequest,
  recordDatabaseOperation,
  recordCacheHit,
  recordCacheMiss,
  recordCacheOperation,
};
