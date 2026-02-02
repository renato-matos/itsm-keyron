// Deve ser executado ANTES de qualquer outro import
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// Variáveis de ambiente
const OTEL_EXPORTER_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
const SERVICE_NAME = process.env.SERVICE_NAME || 'itsm-backend';
const SERVICE_VERSION = process.env.SERVICE_VERSION || '1.0.0';

console.log(`[OpenTelemetry] Iniciando configuração...`);
console.log(`[OpenTelemetry] Service: ${SERVICE_NAME}`);
console.log(`[OpenTelemetry] Endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT}`);

// Criar recurso com metadados da aplicação
const resource = resourceFromAttributes({
  [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
  [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
  environment: process.env.NODE_ENV || 'development',
});

// Configurar exportadores
const traceExporter = new OTLPTraceExporter({
  url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
  concurrencyLimit: 10,
  timeoutMillis: 30000,
});

const metricExporter = new OTLPMetricExporter({
  url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
  timeoutMillis: 30000,
});

// Inicializar Node SDK
const sdk = new NodeSDK({
  resource: resource,
  traceExporter: traceExporter,
  metricExporter: metricExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

// Iniciar SDK
sdk.start();

console.log(`[OpenTelemetry] SDK iniciado com sucesso`);
console.log(`[OpenTelemetry] Exportando traces e métricas para: ${OTEL_EXPORTER_OTLP_ENDPOINT}`);

// Graceful shutdown com flush
process.on('SIGTERM', async () => {
  console.log('[OpenTelemetry] SIGTERM recebido - iniciando shutdown...');
  try {
    await sdk.shutdown();
    console.log('[OpenTelemetry] SDK finalizado com sucesso');
    process.exit(0);
  } catch (error) {
    console.log('[OpenTelemetry] Erro ao finalizar SDK:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('[OpenTelemetry] SIGINT recebido - iniciando shutdown...');
  try {
    await sdk.shutdown();
    console.log('[OpenTelemetry] SDK finalizado com sucesso');
    process.exit(0);
  } catch (error) {
    console.log('[OpenTelemetry] Erro ao finalizar SDK:', error);
    process.exit(1);
  }
});

module.exports = sdk;
