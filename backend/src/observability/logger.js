const pino = require('pino');
const { trace } = require('@opentelemetry/api');

// Use pino-http to connect to Loki
const transport = pino.transport({
  target: 'pino-loki',
  options: {
    host: process.env.LOKI_HOST || 'http://localhost:3100',
    labels: {
      service: process.env.SERVICE_NAME || 'itsm-backend',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.SERVICE_VERSION || '1.0.0',
    },
    batching: true,
    interval: 5000,
    replicas: 1, // Explicitly set replicas to 1
  },
});

// Create logger with Loki transport
const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: {
      service: process.env.SERVICE_NAME || 'itsm-backend',
      version: process.env.SERVICE_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
    mixin() {
      const spanContext = trace.getActiveSpan()?.spanContext();
      return {
        trace_id: spanContext?.traceId,
        span_id: spanContext?.spanId,
        trace_flags: spanContext?.traceFlags,
      };
    },
  },
  transport
);

module.exports = {
  logger,
};