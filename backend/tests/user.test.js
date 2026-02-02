const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock do modelo User antes de importar o app
jest.mock('../src/models', () => ({
  User: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

const app = require('../src/app');
const { User } = require('../src/models');

describe('User Routes', () => {
  let authToken;

  beforeEach(() => {
    authToken = jwt.sign({ userId: 1 }, process.env.SECRET_KEY || 'itsm_super_secret_key', {
      expiresIn: '1h',
    });
    jest.clearAllMocks();
  });

  describe('POST /users - Criar usuário', () => {
    it('deve criar um novo usuário com dados válidos', async () => {
      const newUser = { id: 1, name: 'João Silva', email: 'joao@example.com' };
      User.create.mockResolvedValue(newUser);

      const response = await request(app)
        .post('/users')
        .set('Authorization', authToken)
        .send({
          name: 'João Silva',
          email: 'joao@example.com',
          password: 'senha123'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('João Silva');
      expect(response.body.email).toBe('joao@example.com');
      expect(User.create).toHaveBeenCalled();
    });

    it('deve retornar erro ao criar usuário sem token', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 'João Silva',
          email: 'joao@example.com',
          password: 'senha123'
        });

      expect(response.statusCode).toBe(401);
    });

    it('deve retornar erro ao criar usuário com email duplicado', async () => {
      const email = 'duplicado@example.com';
      const error = new Error('Duplicate email');
      error.name = 'SequelizeUniqueConstraintError';
      User.create.mockRejectedValue(error);

      const response = await request(app)
        .post('/users')
        .set('Authorization', authToken)
        .send({
          name: 'João',
          email: email,
          password: 'senha123'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain('E-mail já está em uso');
    });

    it('deve retornar erro ao criar usuário sem dados obrigatórios', async () => {
      const error = new Error('Validation error');
      User.create.mockRejectedValue(error);

      const response = await request(app)
        .post('/users')
        .set('Authorization', authToken)
        .send({
          name: 'João Silva'
        });

      expect(response.statusCode).toBe(500);
    });
  });

  describe('GET /users - Listar usuários', () => {
    it('deve listar todos os usuários', async () => {
      const users = [
        { id: 1, name: 'João', email: 'joao@example.com' },
        { id: 2, name: 'Maria', email: 'maria@example.com' }
      ];
      User.findAll.mockResolvedValue(users);

      const response = await request(app)
        .get('/users')
        .set('Authorization', authToken);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(User.findAll).toHaveBeenCalled();
    });

    it('deve retornar erro ao listar sem token', async () => {
      const response = await request(app)
        .get('/users');

      expect(response.statusCode).toBe(401);
    });

    it('deve retornar erro com token inválido', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'token_invalido');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /users/:id - Atualizar usuário', () => {
    it('deve atualizar um novo usuário existente', async () => {
      const userId = 1;
      const updatedUser = {
        id: userId,
        name: 'Maria Silva',
        email: 'maria@example.com',
        update: jest.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(updatedUser);

      const response = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', authToken)
        .send({
          name: 'Maria Silva'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.user.name).toBe('Maria Silva');
      expect(User.findByPk).toHaveBeenCalled();
    });

    it('deve retornar erro ao atualizar usuário inexistente', async () => {
      User.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put('/users/99999')
        .set('Authorization', authToken)
        .send({
          name: 'Novo Nome'
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toContain('não encontrado');
    });
  });

  describe('DELETE /users/:id - Deletar usuário', () => {
    it('deve deletar um usuário existente', async () => {
      const userId = 1;
      const userToDelete = {
        id: userId,
        destroy: jest.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(userToDelete);

      const response = await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', authToken);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain('excluído');
      expect(userToDelete.destroy).toHaveBeenCalled();
    });

    it('deve retornar erro ao deletar usuário inexistente', async () => {
      User.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .delete('/users/99999')
        .set('Authorization', authToken);

      expect(response.statusCode).toBe(404);
    });
  });
});
