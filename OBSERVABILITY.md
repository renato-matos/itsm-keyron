# OpenTelemetry - Documentação

## O que foi implementado

Este backend agora possui instrumentação completa com **OpenTelemetry** para:

- ✅ **Traces Distribuídos** - Rastreio de requisições e operações
- ✅ **Métricas** - Contadores e histogramas de performance
- ✅ **Logs Estruturados** - Logging com contexto de trace
- ✅ **Exportação OTLP** - Envio para Jaeger, Prometheus e Grafana

## Arquitetura

```
┌─────────────────────────┐
│   Node.js Backend       │
│  (OpenTelemetry SDK)    │
└───────────┬─────────────┘
            │ OTLP HTTP
            ▼
┌─────────────────────────┐
│  OpenTelemetry Collector│
└───────────┬─────────────┘
            │
    ┌───────┴────────┬───────────┐
    ▼                ▼           ▼
┌────────┐    ┌──────────┐  ┌────────────┐
│ Jaeger │    │Prometheus│  │  Grafana   │
│ (UI)   │    │(Métricas)│  │(Dashboard) │
└────────┘    └──────────┘  └────────────┘
```

## Componentes Implementados

### 1. **Tracer** (`src/observability/tracer.js`)
- Inicializa o OpenTelemetry SDK
- Configura exportador OTLP HTTP
- Conecta ao Jaeger para visualização de traces

### 2. **Logger** (`src/observability/logger.js`)
- Usa **Pino** para logging estruturado
- Adiciona automaticamente `trace_id` e `span_id` aos logs
- Formata logs em JSON para melhor parsing

### 3. **Middleware** (`src/observability/middleware.js`)
- Instrumenta automaticamente todas as requisições HTTP
- Registra método, path, status code
- Marca spans como OK ou ERROR

### 4. **Métricas** (`src/observability/metrics.js`)
- Contador de requisições HTTP
- Contador de erros
- Contador de operações de banco de dados
- Histogramas de latência

### 5. **Spans** (`src/observability/spans.js`)
- Wrappers para instrumentar operações
- `withDatabaseSpan` - Rastreia operações de DB
- `withServiceSpan` - Rastreia lógica de negócio

### 6. **Controller Exemplo** (`src/controllers/userController.js`)
- Demonstra como usar tracing em controllers reais

## Como Usar

### 1. Iniciar a Stack de Observabilidade

```bash
cd /Users/renatomatos/dev/itsm-keyron

# Iniciar Jaeger, Prometheus e Grafana
docker-compose -f docker-compose.otel.yml up -d
```

### 2. Iniciar o Backend com OpenTelemetry

```bash
cd backend
npm start
```

### 3. Fazer Requisições

```bash
# Criar usuário
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: seu_token_jwt" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'

# Listar usuários
curl -X GET http://localhost:3000/users \
  -H "Authorization: seu_token_jwt"
```

### 4. Visualizar Dados

#### **Jaeger (Traces)**
- URL: http://localhost:16686
- Service: `itsm-backend`
- Veja todos os traces de requisições

#### **Prometheus (Métricas)**
- URL: http://localhost:9090
- Query examples:
  ```
  http_requests
  http_errors
  database_operations
  http_request_duration
  ```

#### **Grafana (Dashboard)**
- URL: http://localhost:3000
- Username: `admin`
- Password: `admin`

## Variáveis de Ambiente

```env
# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
SERVICE_NAME=itsm-backend
SERVICE_VERSION=1.0.0
NODE_ENV=development
LOG_LEVEL=info
```

## Exemplos de Uso

### Usar Logger Estruturado

```javascript
const { logger } = require('../observability/logger');

// Estruturado
logger.info({
  event: 'user_created',
  user_id: 123,
  email: 'user@example.com',
  timestamp: new Date().toISOString()
});

// Com contexto de trace automático
logger.error({
  event: 'database_error',
  error: error.message,
  details: error.stack
});
```

### Instrumentar Operação de DB

```javascript
const { withDatabaseSpan } = require('../observability/spans');
const { recordDatabaseOperation } = require('../observability/metrics');

const result = await withDatabaseSpan('select', 'users', async () => {
  const startTime = Date.now();
  const result = await User.findAll();
  recordDatabaseOperation('select', 'users', Date.now() - startTime);
  return result;
});
```

### Instrumentar Serviço

```javascript
const { withServiceSpan } = require('../observability/spans');

const result = await withServiceSpan('email.send', async () => {
  return await sendEmail(user.email);
}, {
  'email.to': user.email,
  'email.type': 'welcome'
});
```

## Dashboards Recomendados no Grafana

### 1. Service Overview
- Taxa de requisições por segundo
- Taxa de erros
- Latência (p50, p95, p99)

### 2. Database Performance
- Operações de DB por tipo
- Latência de queries
- Taxa de sucesso

### 3. Error Tracking
- Erros por tipo
- Stack traces via Jaeger
- Correlação com traces

## Troubleshooting

### Não aparece dados no Jaeger?

```bash
# Verificar se o backend está enviando traces
docker logs jaeger

# Verificar conexão
curl http://localhost:4317/
```

### Métricas não aparecem no Prometheus?

```bash
# Acessar Prometheus
http://localhost:9090

# Verificar targets
http://localhost:9090/targets
```

### Logo de inicialização do tracer?

```bash
# Ver logs do backend
npm start

# Deve aparecer:
# [OpenTelemetry] SDK iniciado para serviço: itsm-backend
# [OpenTelemetry] Endpoint OTLP: http://localhost:4317
```

## Próximos Passos

- [ ] Adicionar alertas no Grafana
- [ ] Instrumentar Redis (se usado)
- [ ] Adicionar profiling de CPU/Memória
- [ ] Integrar com PagerDuty/OpsGenie
- [ ] Criar dashboards customizados
- [ ] Adicionar baggage propagation
- [ ] Integrar tracing com frontend

## Referências

- [OpenTelemetry JS](https://opentelemetry.io/docs/instrumentation/js/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/)
