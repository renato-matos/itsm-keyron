const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
    });

    this.client.on('connect', () => {
      console.log('Redis conectado com sucesso');
    });

    this.client.on('error', (err) => {
      console.error('Erro no Redis:', err);
    });

    // Connect to Redis
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Erro ao conectar ao Redis:', error);
    }
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao buscar no cache:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Erro ao deletar do cache:', error);
      return false;
    }
  }

  async flushPattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Erro ao limpar cache por padrão:', error);
      return false;
    }
  }
}

module.exports = new RedisClient();