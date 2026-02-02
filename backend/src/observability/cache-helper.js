const { trace } = require('@opentelemetry/api');
const { recordCacheHit, recordCacheMiss, recordCacheOperation } = require('./prometheus-metrics');
const redisClient = require('../config/redis');

const tracer = trace.getTracer('cache-helper');

/**
 * Wrapper para operações de cache com registro automático de métricas
 * @param {string} cacheKey - Chave do cache
 * @param {Function} fetchFn - Função para buscar dados em caso de miss
 * @param {number} ttl - Time to live em segundos
 * @returns {Promise} Dados do cache ou resultado de fetchFn
 */
const getCached = async (cacheKey, fetchFn, ttl = 3600) => {
  const startTime = Date.now();
  const span = tracer.startSpan('cache_get');
  
  try {
    span.setAttributes({
      'cache.key': cacheKey,
      'cache.operation': 'get'
    });

    // Tentar obter do cache
    const cachedData = await redisClient.get(cacheKey);
    const operationDuration = Date.now() - startTime;

    if (cachedData) {
      span.setAttributes({
        'cache.hit': true
      });
      span.addEvent('Cache hit');
      recordCacheHit(cacheKey);
      recordCacheOperation('get', cacheKey, operationDuration);
      
      return { data: cachedData, fromCache: true };
    }

    // Cache miss - buscar dados
    span.setAttributes({
      'cache.hit': false
    });
    span.addEvent('Cache miss');
    recordCacheMiss(cacheKey);

    const data = await fetchFn();
    
    // Cachear resultado se bem-sucedido
    await redisClient.set(cacheKey, data, ttl);
    
    const totalDuration = Date.now() - startTime;
    recordCacheOperation('get', cacheKey, totalDuration);
    
    span.addEvent('Data cached');
    
    return { data, fromCache: false };
  } catch (error) {
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
};

/**
 * Invalida uma chave de cache
 * @param {string} pattern - Padrão da chave (suporta wildcards)
 */
const invalidateCache = async (pattern) => {
  const span = tracer.startSpan('cache_invalidate');
  const startTime = Date.now();
  
  try {
    span.setAttributes({
      'cache.pattern': pattern,
      'cache.operation': 'invalidate'
    });

    await redisClient.flushPattern(pattern);
    recordCacheOperation('invalidate', pattern, Date.now() - startTime);
    
    span.addEvent('Cache invalidated');
  } catch (error) {
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
};

/**
 * Define um valor no cache
 * @param {string} cacheKey - Chave do cache
 * @param {*} data - Dados a serem armazenados
 * @param {number} ttl - Time to live em segundos
 */
const setCacheValue = async (cacheKey, data, ttl = 3600) => {
  const span = tracer.startSpan('cache_set');
  const startTime = Date.now();
  
  try {
    span.setAttributes({
      'cache.key': cacheKey,
      'cache.operation': 'set'
    });

    await redisClient.set(cacheKey, data, ttl);
    recordCacheOperation('set', cacheKey, Date.now() - startTime);
    
    span.addEvent('Value cached');
  } catch (error) {
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
};

/**
 * Obtém um valor do cache sem buscar se não existir
 * @param {string} cacheKey - Chave do cache
 */
const getCacheValue = async (cacheKey) => {
  const span = tracer.startSpan('cache_get_direct');
  const startTime = Date.now();
  
  try {
    span.setAttributes({
      'cache.key': cacheKey,
      'cache.operation': 'get_direct'
    });

    const data = await redisClient.get(cacheKey);
    const operationDuration = Date.now() - startTime;
    
    if (data) {
      recordCacheHit(cacheKey);
      span.addEvent('Cache hit');
    } else {
      recordCacheMiss(cacheKey);
      span.addEvent('Cache miss');
    }
    
    recordCacheOperation('get_direct', cacheKey, operationDuration);
    
    return data;
  } catch (error) {
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
};

module.exports = {
  getCached,
  invalidateCache,
  setCacheValue,
  getCacheValue,
};
