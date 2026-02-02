const { context, trace, SpanStatusCode } = require('@opentelemetry/api');
const { recordHttpRequest } = require('./prometheus-metrics');

const tracer = trace.getTracer('itsm-backend');
const logger = require('./logger').logger;

/**
 * Middleware para adicionar tracing automático em requisições HTTP
 */
const tracingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const span = tracer.startSpan(`${req.method} ${req.path}`);
  
  // Adicionar atributos da requisição ao span
  span.setAttributes({
    'http.method': req.method,
    'http.url': req.originalUrl,
    'http.target': req.path,
    'http.host': req.hostname,
    'http.scheme': req.protocol,
  });

  // Executar handler dentro do contexto do span
  context.with(trace.setSpan(context.active(), span), () => {
    // Log estruturado
    logger.info({
      event: 'http_request_started',
      method: req.method,
      path: req.path,
      trace_id: span.spanContext().traceId,
    });

    // Interceptar resposta
    const originalSend = res.send;
    res.send = function (data) {
      const durationMs = Date.now() - startTime;
      
      span.setAttributes({
        'http.status_code': res.statusCode,
        'http.duration_ms': durationMs,
      });

      // Registrar métrica no Prometheus
      recordHttpRequest(req.method, req.path, res.statusCode, durationMs);

      if (res.statusCode >= 400) {
        span.setStatus({ code: SpanStatusCode.ERROR });
        logger.error({
          event: 'http_request_error',
          status_code: res.statusCode,
          method: req.method,
          path: req.path,
          duration_ms: durationMs,
          trace_id: span.spanContext().traceId,
        });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
        logger.info({
          event: 'http_request_completed',
          status_code: res.statusCode,
          method: req.method,
          path: req.path,
          duration_ms: durationMs,
          trace_id: span.spanContext().traceId,
        });
      }

      span.end();
      return originalSend.call(this, data);
    };

    next();
  });
};

module.exports = {
  tracingMiddleware,
};
