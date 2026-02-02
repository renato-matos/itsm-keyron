const { trace, SpanStatusCode } = require('@opentelemetry/api');

const tracer = trace.getTracer('itsm-backend');

/**
 * Wrapper para instrumentar operações de banco de dados com tracing
 */
const withDatabaseSpan = async (operation, table, fn) => {
  const span = tracer.startSpan(`db.${operation}`, {
    attributes: {
      'db.system': 'postgresql',
      'db.operation': operation,
      'db.table': table,
    },
  });

  try {
    const startTime = Date.now();
    const result = await fn();
    const duration = Date.now() - startTime;

    span.setAttributes({
      'db.duration_ms': duration,
      'db.success': true,
    });
    span.setStatus({ code: SpanStatusCode.OK });

    return result;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    throw error;
  } finally {
    span.end();
  }
};

/**
 * Wrapper para instrumentar serviços/controller com tracing
 */
const withServiceSpan = async (operation, fn, attributes = {}) => {
  const span = tracer.startSpan(`service.${operation}`, {
    attributes: {
      ...attributes,
    },
  });

  try {
    const result = await fn();
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    throw error;
  } finally {
    span.end();
  }
};


module.exports = {
  withDatabaseSpan,
  withServiceSpan,
};
