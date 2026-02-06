// Mock API BEFORE importing serviceService
jest.mock('../../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

import serviceService from '../../services/serviceService';
import api from '../../services/api';

describe('Service Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.warn = jest.fn();
  });

  describe('getAll', () => {
    it('should return array when API returns array', async () => {
      const mockServices = [
        { id: 1, name: 'Service 1', category: 'Infraestrutura', status: 'Ativo' },
        { id: 2, name: 'Service 2', category: 'Software', status: 'Ativo' }
      ];

      api.get.mockResolvedValue({ data: mockServices });

      const result = await serviceService.getAll({});

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Service 1');
      expect(api.get).toHaveBeenCalledWith('/services?');
    });

    it('should extract array from data.data structure', async () => {
      const mockServices = [
        { id: 1, name: 'Service 1' },
        { id: 2, name: 'Service 2' }
      ];

      api.get.mockResolvedValue({ data: { data: mockServices } });

      const result = await serviceService.getAll({});

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Service 1');
    });

    it('should extract array from cached object with numeric keys', async () => {
      const cachedData = {
        0: { id: 1, name: 'Service 1' },
        1: { id: 2, name: 'Service 2' },
        _cached: true,
        _cachedAt: '2026-02-05T12:00:00Z'
      };

      api.get.mockResolvedValue({ data: cachedData });

      const result = await serviceService.getAll({});

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Service 1');
    });

    it('should return empty array on error', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      const result = await serviceService.getAll({});

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should include category filter in request', async () => {
      api.get.mockResolvedValue({ data: [] });

      await serviceService.getAll({ category: 'Infraestrutura' });

      expect(api.get).toHaveBeenCalledWith('/services?category=Infraestrutura');
    });

    it('should include status filter in request', async () => {
      api.get.mockResolvedValue({ data: [] });

      await serviceService.getAll({ status: 'Ativo' });

      expect(api.get).toHaveBeenCalledWith('/services?status=Ativo');
    });

    it('should include both filters in request', async () => {
      api.get.mockResolvedValue({ data: [] });

      await serviceService.getAll({ category: 'Software', status: 'Inativo' });

      expect(api.get).toHaveBeenCalledWith('/services?category=Software&status=Inativo');
    });
  });

  describe('getById', () => {
    it('should fetch service by id', async () => {
      const mockService = { id: 1, name: 'Service 1' };
      api.get.mockResolvedValue({ data: mockService });

      const result = await serviceService.getById(1);

      expect(result.name).toBe('Service 1');
      expect(api.get).toHaveBeenCalledWith('/services/1');
    });
  });

  describe('create', () => {
    it('should create new service', async () => {
      const newService = { name: 'New Service', category: 'Support' };
      const createdService = { id: 1, ...newService };
      api.post.mockResolvedValue({ data: createdService });

      const result = await serviceService.create(newService);

      expect(result.id).toBe(1);
      expect(result.name).toBe('New Service');
      expect(api.post).toHaveBeenCalledWith('/services', newService);
    });
  });

  describe('update', () => {
    it('should update service', async () => {
      const updatedData = { name: 'Updated Service' };
      const result = { id: 1, ...updatedData };
      api.put.mockResolvedValue({ data: result });

      const response = await serviceService.update(1, updatedData);

      expect(response.name).toBe('Updated Service');
      expect(api.put).toHaveBeenCalledWith('/services/1', updatedData);
    });
  });

  describe('delete', () => {
    it('should delete service', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      const result = await serviceService.delete(1);

      expect(result.success).toBe(true);
      expect(api.delete).toHaveBeenCalledWith('/services/1');
    });
  });
});
