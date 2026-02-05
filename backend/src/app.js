const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const { tracingMiddleware } = require("./observability/middleware");
const { register } = require("./observability/prometheus-metrics");
const app = express();

// Configurar middleware de tracing ANTES das outras middleware
app.use(tracingMiddleware);

// Configurar CORS
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rota para Prometheus scrape das métricas
app.get("/metrics", async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Rota base para teste
app.get("/", (req, res) => {
  res.send("Sistema ITSM rodando!");
});

const userRoutes = require("./routes/user");

app.use("/users", userRoutes);

const authRoutes = require("./routes/auth");

app.use("/auth", authRoutes);

// Adicionar as rotas de serviços
const serviceRoutes = require("./routes/service");
app.use("/services", serviceRoutes);

module.exports = app;