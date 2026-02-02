const redisClient = require('../config/redis');
const { trace } = require('@opentelemetry/api');
const { recordCacheHit, recordCacheMiss, recordCacheOperation } = require('../observability/prometheus-metrics');

const tracer = trace.getTracer('cache-middleware');

const cacheMiddleware = (ttl = 3600) => {
  return async (req, res, next) => {
    const span = tracer.startSpan('cache_lookup');
    const startTime = Date.now();
    
    try {
      const cacheKey = `${req.method}:${req.originalUrl}`;
      span.setAttributes({
        'cache.key': cacheKey,
        'cache.operation': 'lookup'
      });

      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        span.setAttributes({
          'cache.hit': true
        });
        span.addEvent('Cache hit');
        recordCacheHit(cacheKey);
        recordCacheOperation('lookup', cacheKey, Date.now() - startTime);
        span.end();
        
        return res.json({
          ...cachedData,
          _cached: true,
          _cachedAt: new Date().toISOString()
        });
      }

      span.setAttributes({
        'cache.hit': false
      });
      span.addEvent('Cache miss');
      recordCacheMiss(cacheKey);

      // Interceptar a resposta para cachear
      const originalJson = res.json;
      res.json = function(data) {
        // Cachear apenas respostas de sucesso
        if (res.statusCode === 200) {
          redisClient.set(cacheKey, data, ttl);
          span.addEvent('Data cached');
        }
        recordCacheOperation('lookup', cacheKey, Date.now() - startTime);
        span.end();
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error({
        event: 'cache_middleware_error',
        error: error.message,
      });
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      span.end();
      next(); // Continua sem cache em caso de erro
    }
  };
};

module.exports = cacheMiddleware;