const express = require("express");
const { Service } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");
const { withServiceSpan, withDatabaseSpan } = require("../observability/spans");
const { recordDatabaseOperation } = require("../observability/prometheus-metrics");
const { logger } = require("../observability/logger");
const { invalidateCache } = require("../observability/cache-helper");
const cacheMiddleware = require("../middlewares/cache");
const router = express.Router();

// CREATE - Criar um novo serviço
router.post("/", authMiddleware, async (req, res) => {
  return withServiceSpan('service.create', async () => {
    try {
      const { name, description, category, status, owner } = req.body;
      
      const service = await withDatabaseSpan('create', 'services', async () => {
        const startTime = Date.now();
        const result = await Service.create({
          name,
          description,
          category,
          status,
          owner
        });
        recordDatabaseOperation('create', 'services', Date.now() - startTime, true);
        return result;
      });

      // Invalidar cache de lista de serviços com registros automáticos de métrica
      await invalidateCache('GET:/services');

      logger.info({
        event: 'service_created',
        service_id: service.id,
        name: service.name,
        message: 'Serviço criado com sucesso',
      });
      
      return res.status(201).json({
        message: "Serviço criado com sucesso!",
        service
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        logger.warn({
          event: 'invalid_service_data',
          name: req.body.name,
          message: 'Tentativa de criar serviço com dados inválidos',
        });
        return res.status(400).json({
          error: "Dados inválidos.",
          details: error.errors.map(err => err.message)
        });
      }
      logger.error({
        event: 'service_creation_failed',
        error: error.message,
        name: req.body.name,
      });
      return res.status(500).json({ error: "Erro ao criar serviço." });
    }
  });
});

// READ ALL - Listar todos os serviços - Cache de lista por 2 minutos
router.get("/", authMiddleware, cacheMiddleware(120), async (req, res) => {
  return withServiceSpan('service.list', async () => {
    try {
      const { category, status } = req.query;
      
      // Filtros opcionais
      const whereClause = {};
      if (category) whereClause.category = category;
      if (status) whereClause.status = status;
      
      const services = await withDatabaseSpan('findAll', 'services', async () => {
        const startTime = Date.now();
        const result = await Service.findAll({
          where: whereClause,
          order: [['createdAt', 'DESC']]
        });
        recordDatabaseOperation('findAll', 'services', Date.now() - startTime, true);
        return result;
      });
      
      logger.info({
        event: 'services_listed',
        count: services.length,
        message: `Listados ${services.length} serviços`,
      });

      return res.status(200).json(services);
    } catch (error) {
      logger.error({
        event: 'service_list_failed',
        error: error.message,
      });
      return res.status(500).json({ error: "Erro ao buscar serviços." });
    }
  });
});

// READ ONE - Buscar um serviço específico por ID - Cache de consulta por 5 minutos
router.get("/:id", authMiddleware, cacheMiddleware(300), async (req, res) => {
  return withServiceSpan('service.get', async () => {
    try {
      const { id } = req.params;
      
      const service = await withDatabaseSpan('findByPk', 'services', async () => {
        const startTime = Date.now();
        const result = await Service.findByPk(id);
        recordDatabaseOperation('findByPk', 'services', Date.now() - startTime, true);
        return result;
      });
      
      if (!service) {
        logger.warn({
          event: 'service_not_found',
          service_id: id,
          message: 'Serviço não encontrado',
        });
        return res.status(404).json({ error: "Serviço não encontrado." });
      }

      logger.info({
        event: 'service_fetched',
        service_id: service.id,
        name: service.name,
        message: 'Serviço recuperado com sucesso',
      });

      return res.status(200).json(service);
    } catch (error) {
      logger.error({
        event: 'service_fetch_failed',
        service_id: req.params.id,
        error: error.message,
      });
      return res.status(500).json({ error: "Erro ao buscar serviço." });
    }
  });
});

// UPDATE - Atualizar um serviço específico
router.put("/:id", authMiddleware, async (req, res) => {
  return withServiceSpan('service.update', async () => {
    try {
      const { id } = req.params;
      const { name, description, category, status, owner } = req.body;
      
      // Verificar se o serviço existe
      const service = await withDatabaseSpan('findByPk', 'services', async () => {
        const startTime = Date.now();
        const result = await Service.findByPk(id);
        recordDatabaseOperation('findByPk', 'services', Date.now() - startTime, true);
        return result;
      });
      if (!service) {
        logger.warn({
          event: 'service_not_found_for_update',
          service_id: id,
          message: 'Tentativa de atualizar serviço inexistente',
        });
        return res.status(404).json({ error: "Serviço não encontrado." });
      }
      
      // Preparar dados para atualização
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (status !== undefined) updateData.status = status;
      if (owner !== undefined) updateData.owner = owner;
      
      // Realizar a atualização
      await withDatabaseSpan('update', 'services', async () => {
        const startTime = Date.now();
        await service.update(updateData);
        recordDatabaseOperation('update', 'services', Date.now() - startTime, true);
      });

      // Invalidar caches relacionados com registros automáticos de métrica
      await invalidateCache(`GET:/services/${req.params.id}`);
      await invalidateCache('GET:/services');

      logger.info({
        event: 'service_updated',
        service_id: service.id,
        name: service.name,
        message: 'Serviço atualizado com sucesso',
      });

      return res.status(200).json({
        message: "Serviço atualizado com sucesso!",
        service
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        logger.warn({
          event: 'invalid_service_update_data',
          service_id: req.params.id,
          message: 'Tentativa de atualizar serviço com dados inválidos',
        });
        return res.status(400).json({
          error: "Dados inválidos.",
          details: error.errors.map(err => err.message)
        });
      }
      logger.error({
        event: 'service_update_failed',
        service_id: req.params.id,
        error: error.message,
      });
      return res.status(500).json({ error: "Erro ao atualizar serviço." });
    }
  });
});


// DELETE - Excluir um serviço específico
router.delete("/:id", authMiddleware, async (req, res) => {
  await withServiceSpan('service.delete', async () => {
    try {
      const { id } = req.params;
      
      // Verificar se o serviço existe
      const service = await Service.findByPk(id);
      if (!service) {
        logger.warn({
          event: 'service_not_found_for_deletion',
          service_id: id,
          message: 'Tentativa de excluir serviço inexistente',
        });
        return res.status(404).json({ error: "Serviço não encontrado." });
      }
      
      // Invalidar caches relacionados com registros automáticos de métrica
      await invalidateCache(`GET:/services/${req.params.id}`);   
      await invalidateCache('GET:/services');

      // Excluir o serviço
      await withDatabaseSpan('destroy', 'services', async () => {
        const startTime = Date.now();
        await service.destroy();
        recordDatabaseOperation('destroy', 'services', Date.now() - startTime, true);
      });
      
      logger.info({
        event: 'service_deleted',
        service_id: service.id,
        name: service.name,
        message: 'Serviço excluído com sucesso',
      });

      return res.status(200).json({ message: "Serviço excluído com sucesso!" });
    } catch (error) {
      logger.error({
        event: 'service_deletion_failed',
        service_id: req.params.id,
        error: error.message,
      });
      return res.status(500).json({ error: "Erro ao excluir serviço." });
    }
  });
});

module.exports = router;