const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock do modelo Service antes de importar o app
jest.mock('../src/models', () => ({
  Service: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

const app = require('../src/app');
const { Service } = require('../src/models');

describe('Service Routes', () => {
  let authToken;

  beforeEach(() => {
    authToken = jwt.sign({ userId: 1 }, process.env.SECRET_KEY || 'itsm_super_secret_key', {
      expiresIn: '1h',
    });
    jest.clearAllMocks();
  });

  describe('POST /services - Criar serviço', () => {
    it('deve criar um novo serviço com dados válidos', async () => {
      const newService = { id: 1, name: 'Suporte Técnico', description: 'Suporte 24/7' };
      Service.create.mockResolvedValue(newService);

      const response = await request(app)
        .post('/services')
        .set('Authorization', authToken)
        .send({
          name: 'Suporte Técnico',
          description: 'Suporte técnico 24/7'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('service');
      expect(response.body.service.name).toBe('Suporte Técnico');
      expect(Service.create).toHaveBeenCalled();
    });

    it('deve retornar erro ao criar serviço sem autenticação', async () => {
      const response = await request(app)
        .post('/services')
        .send({
          name: 'Suporte Técnico',
          description: 'Suporte técnico 24/7'
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /services - Listar serviços', () => {
    it('deve listar todos os serviços', async () => {
      const services = [
        { id: 1, name: 'Suporte', description: 'Suporte técnico' },
        { id: 2, name: 'Consultoria', description: 'Consultoria em TI' }
      ];
      Service.findAll.mockResolvedValue(services);

      const response = await request(app)
        .get('/services')
        .set('Authorization', authToken);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(Service.findAll).toHaveBeenCalled();
    });

    it('deve retornar erro ao listar sem token', async () => {
      const response = await request(app)
        .get('/services');

      expect(response.statusCode).toBe(401);
    });
  });
});
