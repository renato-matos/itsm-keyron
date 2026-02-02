#!/bin/bash

# Script para iniciar a stack completa de observabilidade + backend

set -e

echo "🚀 Iniciando Stack de Observabilidade + Backend ITSM..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Docker está rodando
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não instalado"
    exit 1
fi

cd "$(dirname "$0")"

# 1. Parar e limpar containers antigos
echo -e "${YELLOW}🧹 Limpando containers antigos...${NC}"
docker-compose -f docker-compose.otel.yml down --remove-orphans 2>/dev/null || true
sleep 2

# 2. Iniciar services Docker
echo -e "${YELLOW}📦 Iniciando Docker Compose (Jaeger, Prometheus, Grafana)...${NC}"
docker-compose -f docker-compose.otel.yml up -d

echo -e "${GREEN}✓ Docker services iniciados${NC}"
echo ""

# Esperar serviços ficarem ready
echo -e "${YELLOW}⏳ Aguardando serviços ficarem prontos...${NC}"
sleep 5

# Verificar se serviços estão rodando
echo -e "${YELLOW}🔍 Verificando serviços...${NC}"
if ! docker ps | grep -q jaeger; then
    echo -e "${RED}❌ Jaeger não iniciou${NC}"
    exit 1
fi
if ! docker ps | grep -q prometheus; then
    echo -e "${RED}❌ Prometheus não iniciou${NC}"
    exit 1
fi
if ! docker ps | grep -q grafana; then
    echo -e "${RED}❌ Grafana não iniciou${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Todos os serviços estão rodando${NC}"
echo ""

# 3. Iniciar backend
echo -e "${YELLOW}📝 Iniciando Backend...${NC}"
cd backend

# Instalar dependências se não existir node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Iniciar backend
npm start &
BACKEND_PID=$!

echo ""
echo -e "${GREEN}✓ Backend iniciado (PID: $BACKEND_PID)${NC}"
echo ""

# 3. Exibir informações úteis
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Stack iniciada com sucesso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 Dashboards:"
echo "  • Jaeger (Traces):       http://localhost:16686"
echo "  • Prometheus (Métricas): http://localhost:9090"
echo "  • Grafana (Dashboard):   http://localhost:3000"
echo "  • Backend:               http://localhost:3000"
echo ""
echo "🔐 Grafana Credentials:"
echo "  • Username: admin"
echo "  • Password: admin"
echo ""
echo "🧪 Testes de Conectividade:"
echo ""
echo "  Criar usuário:"
echo "  curl -X POST http://localhost:3000/users \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -H 'Authorization: seu_token' \\"
echo "    -d '{\"name\":\"Test\",\"email\":\"test@example.com\",\"password\":\"123456\"}'"
echo ""
echo "  Listar usuários:"
echo "  curl -X GET http://localhost:3000/users \\"
echo "    -H 'Authorization: seu_token'"
echo ""
echo "📝 Próximos passos:"
echo "  1. Faça requisições ao backend"
echo "  2. Veja os traces no Jaeger: http://localhost:16686"
echo "  3. Veja as métricas no Prometheus: http://localhost:9090"
echo "  4. Configure dashboards no Grafana: http://localhost:3000"
echo ""
echo "🛑 Para parar:"
echo "  • Pressione Ctrl+C para parar o backend"
echo "  • Execute: docker-compose -f docker-compose.otel.yml down"
echo ""

# Aguardar término
wait $BACKEND_PID

