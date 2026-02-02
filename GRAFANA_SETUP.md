# Guia Rápido - Grafana com OpenTelemetry

## 1. Acessar Grafana

```
URL: http://localhost:3000
Username: admin
Password: admin
```

## 2. Adicionar Data Source Prometheus

1. Vá para **Configuration** → **Data Sources**
2. Clique em **Add data source**
3. Selecione **Prometheus**
4. URL: `http://prometheus:9090`
5. Clique em **Save & test**

## 3. Adicionar Data Source Jaeger

1. Clique em **Add data source**
2. Selecione **Jaeger**
3. URL: `http://jaeger:16686`
4. Clique em **Save & test**

## 4. Criar Dashboard

### Dashboard 1: HTTP Requests Overview

```json
{
  "dashboard": {
    "title": "HTTP Requests Overview",
    "panels": [
      {
        "title": "Requisições por Segundo",
        "targets": [{"expr": "rate(http_requests_total[1m])"}]
      },
      {
        "title": "Taxa de Erro",
        "targets": [{"expr": "rate(http_errors_total[1m])"}]
      },
      {
        "title": "Latência P95",
        "targets": [{"expr": "histogram_quantile(0.95, http_request_duration)"}]
      }
    ]
  }
}
```

### Dashboard 2: Database Performance

```json
{
  "dashboard": {
    "title": "Database Performance",
    "panels": [
      {
        "title": "Operações de DB",
        "targets": [{"expr": "rate(database_operations_total[1m])"}]
      },
      {
        "title": "Latência de Queries",
        "targets": [{"expr": "database_query_duration"}]
      },
      {
        "title": "Operações por Tipo",
        "targets": [{"expr": "database_operations_total"}]
      }
    ]
  }
}
```

## 5. Consultas Prometheus Úteis

### Taxa de Requisições
```prometheus
rate(http_requests_total[1m])
```

### Taxa de Erros
```prometheus
rate(http_errors_total[1m])
```

### Latência Média
```prometheus
rate(http_request_duration_sum[1m]) / rate(http_request_duration_count[1m])
```

### Latência Percentil
```prometheus
histogram_quantile(0.95, rate(http_request_duration_bucket[5m]))
```

### Operações de DB por Tipo
```prometheus
rate(database_operations_total[1m]) by (db_operation)
```

## 6. Integração com Jaeger

1. No Grafana, vá para **Explore** → selecione **Jaeger**
2. Procure por traces do serviço `itsm-backend`
3. Correlacione com métricas do Prometheus

## 7. Alertas (Opcional)

### Criar Alerta de Taxa de Erro Alta

1. Vá para **Alerting** → **Alert rules**
2. Clique em **Create alert rule**
3. Condição: `rate(http_errors_total[1m]) > 0.1`
4. Configure notificações

## 8. Visualizar Logs com Traces

### No Jaeger:
1. Abra http://localhost:16686
2. Selecione serviço `itsm-backend`
3. Procure por operação e clique em um trace
4. Veja todas as operações e timing

## Dicas

- **Pino Logger**: Os logs estruturados aparecem no console e contêm `trace_id`
- **Correlação**: Use `trace_id` para correlacionar logs com traces
- **Métricas**: Prometheus coleta dados a cada 15 segundos
- **Retenção**: Prometheus mantém dados por 15 dias (configurável)

## Troubleshooting

**Problema**: Nenhum dado aparece no Prometheus
```bash
# Verificar se Prometheus coleta métricas
docker-compose logs prometheus
```

**Problema**: Jaeger não mostra traces
```bash
# Verificar se está recebendo spans
docker logs jaeger
```

**Problema**: Grafana não conecta ao Prometheus
```bash
# Testar conexão do container
docker-compose exec grafana curl http://prometheus:9090
```
