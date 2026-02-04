const express = require("express");
const { User } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");
const { withDatabaseSpan, withServiceSpan } = require("../observability/spans");
const { logger } = require("../observability/logger");
const { recordDatabaseOperation } = require("../observability/prometheus-metrics");
const { invalidateCache } = require("../observability/cache-helper");
const cacheMiddleware = require("../middlewares/cache");
const messageService = require("../services/messageService");

const router = express.Router();

// Criar um novo usuário
router.post("/", authMiddleware, async (req, res) => {
  return withServiceSpan('user.create', async () => {
    try {
      const { name, email, password } = req.body;

      const user = await withDatabaseSpan('create', 'users', async () => {
        const startTime = Date.now();
        const result = await User.create({ name, email, password });
        recordDatabaseOperation('create', 'users', Date.now() - startTime, true);
        return result;
      });

      // Invalidar cache de lista de usuários com registros automáticos de métrica
      await invalidateCache('GET:/users');

      // Publicar evento de criação de usuário
      await messageService.publishUserRegistered(user);

      // Enviar notificação de boas-vindas
      await messageService.sendNotification({
        userId: user.id,
        email: user.email,
        type: 'welcome',
        title: 'Bem-vindo!',
        message: `Olá ${user.name}, seja bem-vindo ao nosso sistema!`,
        metadata: { isWelcome: true }
      });
    
      logger.info({
        event: 'user_created',
        user_id: user.id,
        email: user.email,
        message: 'Usuário criado com sucesso',
      });

      return res.status(201).json({
        message: "Usuário criado com sucesso!",
        user
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        logger.warn({
          event: 'duplicate_email',
          email: req.body.email,
          message: 'Tentativa de criar usuário com email duplicado',
        });
        return res.status(400).json({ error: "E-mail já está em uso por outro usuário." });
      }
      logger.error({
        event: 'user_creation_failed',
        error: error.message,
        email: req.body.email,
      });
      return res.status(500).json({ error: "Erro ao criar usuário.", details: error.message });
    }
  });
});

// Buscar todos os usuários - cache de 5 minutos
router.get("/", authMiddleware, cacheMiddleware(300), async (req, res) => {
  return withServiceSpan('user.list', async () => {
    try {
      const users = await withDatabaseSpan('find', 'users', async () => {
        const startTime = Date.now();
        const result = await User.findAll();
        recordDatabaseOperation('find', 'users', Date.now() - startTime, true);
        return result;
      });

      logger.info({
        event: 'users_listed',
        count: users.length,
        message: `Listados ${users.length} usuários`,
      });

      return res.status(200).json(users);
    } catch (error) {
      logger.error({
        event: 'user_listing_failed',
        error: error.message,
      });
      return res.status(500).json({ error: "Erro ao buscar usuários.", details: error.message });
    }
  });
});

// Atualizar um usuário específico
router.put("/:id", authMiddleware, async (req, res) => {
  return withServiceSpan('user.update', async () => {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;

      const user = await withDatabaseSpan('findById', 'users', async () => {
        const startTime = Date.now();
        const result = await User.findByPk(id);
        recordDatabaseOperation('findById', 'users', Date.now() - startTime, true);
        return result;
      });

      if (!user) {
        logger.warn({
          event: 'user_not_found',
          user_id: id,
          message: 'Tentativa de atualizar usuário inexistente',
        });
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      await withDatabaseSpan('update', 'users', async () => {
        const startTime = Date.now();
        await user.update(updateData);
        recordDatabaseOperation('update', 'users', Date.now() - startTime, true);
      });

      // Invalidar caches relacionados com registros automáticos de métrica
      await invalidateCache(`GET:/users/${req.params.id}`);
      await invalidateCache('GET:/users');

      logger.info({
        event: 'user_updated',
        user_id: id,
        message: 'Usuário atualizado com sucesso',
      });

      return res.status(200).json({
        message: "Usuário atualizado com sucesso!",
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        logger.warn({
          event: 'duplicate_email',
          user_id: req.params.id,
          message: 'Tentativa de atualizar usuário com email duplicado',
        });
        return res.status(400).json({ error: "E-mail já está em uso por outro usuário." });
      }
      logger.error({
        event: 'user_update_failed',
        user_id: req.params.id,
        error: error.message,
      });
      return res.status(500).json({ error: "Erro ao atualizar usuário.", details: error.message });
    }
  });
});

// Buscar um usuário específico por ID - Cache de 10 minutos
router.get("/:id", authMiddleware, cacheMiddleware(600), async (req, res) => {
  return withServiceSpan('user.get', async () => {
    try {
      const { id } = req.params;

      const user = await withDatabaseSpan('findById', 'users', async () => {
        const startTime = Date.now();
        const result = await User.findByPk(id, {
          attributes: { exclude: ['password'] }
        });
        recordDatabaseOperation('findById', 'users', Date.now() - startTime, true);
        return result;
      });

      if (!user) {
        logger.warn({
          event: 'user_not_found',
          user_id: id,
          message: 'Usuário não encontrado',
        });
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      logger.info({
        event: 'user_retrieved',
        user_id: id,
        message: 'Usuário recuperado com sucesso',
      });

      return res.status(200).json(user);
    } catch (error) {
      logger.error({
        event: 'user_retrieval_failed',
        user_id: req.params.id,
        error: error.message,
      });
      return res.status(500).json({ error: "Erro ao buscar usuário.", details: error.message });
    }
  });
});

// Excluir um usuário específico
router.delete("/:id", authMiddleware, async (req, res) => {
  return withServiceSpan('user.delete', async () => {
    try {
      const { id } = req.params;

      const user = await withDatabaseSpan('findById', 'users', async () => {
        const startTime = Date.now();
        const result = await User.findByPk(id);
        recordDatabaseOperation('findById', 'users', Date.now() - startTime, true);
        return result;
      });

      if (!user) {
        logger.warn({
          event: 'user_not_found',
          user_id: id,
          message: 'Tentativa de deletar usuário inexistente',
        });
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      await withDatabaseSpan('delete', 'users', async () => {
        const startTime = Date.now();
        await user.destroy();
        recordDatabaseOperation('delete', 'users', Date.now() - startTime, true);
      });

      // Invalidar caches relacionados com registros automáticos de métrica
      await invalidateCache(`GET:/users/${req.params.id}`);   
      await invalidateCache('GET:/users');

      logger.info({
        event: 'user_deleted',
        user_id: id,
        message: 'Usuário deletado com sucesso',
      });

      return res.status(200).json({ message: "Usuário excluído com sucesso!" });
    } catch (error) {
      logger.error({
        event: 'user_deletion_failed',
        user_id: req.params.id,
        error: error.message,
      });
      return res.status(500).json({ error: "Erro ao excluir usuário.", details: error.message });
    }
  });
});

module.exports = router;