# OpenTelemetry Setup Completo - ITSM Backend

## 📦 Pacotes Instalados

```bash
✅ @opentelemetry/api
✅ @opentelemetry/sdk-node
✅ @opentelemetry/auto-instrumentations-node
✅ @opentelemetry/sdk-trace-node
✅ @opentelemetry/sdk-metrics
✅ @opentelemetry/exporter-trace-otlp-http
✅ @opentelemetry/resources
✅ @opentelemetry/semantic-conventions
✅ @opentelemetry/instrumentation-express
✅ @opentelemetry/instrumentation-http
✅ @opentelemetry/instrumentation-pg
✅ pino (logging estruturado)
```

## 📁 Arquivos Criados

```
backend/src/observability/
├── tracer.js           # Inicializa OpenTelemetry SDK
├── logger.js           # Logger estruturado com Pino
├── middleware.js       # Middleware para tracing de HTTP
├── metrics.js          # Contadores e histogramas
└── spans.js            # Wrappers para spans customizados

backend/src/controllers/
└── userController.js   # Exemplo de controller com tracing

Raiz do projeto/
├── docker-compose.otel.yml    # Stack Docker (Jaeger, Prometheus, Grafana)
├── prometheus.yml             # Configuração Prometheus
├── otel-collector-config.yml  # Configuração OpenTelemetry Collector
├── OBSERVABILITY.md           # Documentação completa
├── GRAFANA_SETUP.md           # Guia de setup Grafana
└── start-stack.sh             # Script para iniciar tudo
```

## 🚀 Como Iniciar

### Opção 1: Script Automático (Recomendado)

```bash
cd /Users/renatomatos/dev/itsm-keyron
./start-stack.sh
```

### Opção 2: Manual

```bash
# Terminal 1: Iniciar stack de observabilidade
cd /Users/renatomatos/dev/itsm-keyron
docker-compose -f docker-compose.otel.yml up -d

# Terminal 2: Iniciar backend
cd backend
npm start
```

## 🔍 Visualizar Dados

| Ferramenta | URL | Funcionalidade |
|-----------|-----|-----------------|
| **Jaeger** | http://localhost:16686 | Visualizar traces e spans |
| **Prometheus** | http://localhost:9090 | Consultar métricas |
| **Grafana** | http://localhost:3000 | Dashboards (admin/admin) |
| **Backend** | http://localhost:3000 | Sua API |

## 📊 O que é Rastreado

### ✅ Traces (Jaeger)
- Todas as requisições HTTP (método, path, status)
- Operações de banco de dados (create, read, update, delete)
- Latência de cada operação
- Stack traces em caso de erro

### ✅ Métricas (Prometheus)
- Taxa de requisições por segundo
- Taxa de erros
- Latência (p50, p95, p99)
- Operações de DB por tipo
- Contadores de sucesso/falha

### ✅ Logs (Pino)
- Logs estruturados em JSON
- Trace ID automático em cada log
- Span ID para correlação
- Stack traces de erros

## 💻 Exemplo de Uso

### Fazer uma requisição

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: seu_token_jwt" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### Ver no Jaeger
1. Abra http://localhost:16686
2. Service: `itsm-backend`
3. Operation: `POST /users`
4. Clique em um trace para ver detalhes

### Ver no Prometheus
1. Abra http://localhost:9090
2. Query: `rate(http_requests[1m])`
3. Veja o gráfico de requisições

### Ver no Grafana
1. Abra http://localhost:3000
2. Login: admin/admin
3. Crie um dashboard com a métrica `http_requests`

## 📝 Logs Estruturados

Os logs agora incluem contexto automático:

```json
{
  "level": 30,
  "time": "2026-01-28T17:30:45.123Z",
  "event": "user_created",
  "user_id": 1,
  "email": "joao@example.com",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "message": "Usuário criado com sucesso"
}
```

## 🔧 Variáveis de Ambiente

```env
# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
SERVICE_NAME=itsm-backend
SERVICE_VERSION=1.0.0
NODE_ENV=development
LOG_LEVEL=info
```

## 📚 Usar em Controllers

```javascript
const { withDatabaseSpan, withServiceSpan } = require('../observability/spans');
const { logger } = require('../observability/logger');
const { recordDatabaseOperation } = require('../observability/metrics');

// Seu código aqui com spans customizados
const result = await withDatabaseSpan('select', 'users', async () => {
  return await User.findAll();
});

logger.info({
  event: 'operation_completed',
  count: result.length,
});
```

## 🛑 Parar Stack

```bash
# Parar backend (Ctrl+C no terminal)

# Parar Docker services
docker-compose -f docker-compose.otel.yml down

# Ou remover volumes também
docker-compose -f docker-compose.otel.yml down -v
```

## 🐛 Troubleshooting

### Nenhum dado aparece?
```bash
# Verificar logs do backend
npm start

# Verificar conectividade
curl http://localhost:4317/
```

### Docker não inicia?
```bash
# Verificar se portas estão livres
lsof -i :16686  # Jaeger
lsof -i :9090   # Prometheus
lsof -i :3000   # Grafana
```

### OpenTelemetry não inicializa?
```bash
# Verificar logs
tail -f backend/logs/opentelemetry.log

# Verificar dependências
npm list | grep opentelemetry
```

## 📖 Documentação Adicional

- [OBSERVABILITY.md](./OBSERVABILITY.md) - Documentação completa
- [GRAFANA_SETUP.md](./GRAFANA_SETUP.md) - Guia Grafana
- [OpenTelemetry JS Docs](https://opentelemetry.io/docs/instrumentation/js/)

## ✨ Próximos Passos

- [ ] Adicionar alertas no Grafana
- [ ] Instrumentar Redis (se usar)
- [ ] Adicionar Service Map no Jaeger
- [ ] Criar dashboards customizados
- [ ] Integrar com equipe de SRE
- [ ] Configurar retenção de dados
- [ ] Adicionar correlação com frontend

## 🎯 Objetivos Alcançados

✅ Traces distribuídos com Jaeger
✅ Métricas com Prometheus
✅ Logs estruturados com Pino
✅ Dashboards no Grafana
✅ Instrumentação automática de HTTP
✅ Instrumentação de banco de dados
✅ Context propagation (trace_id em logs)
✅ Error tracking integrado

---

**Backend agora está 100% observável!** 🚀
