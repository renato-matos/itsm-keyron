// Mock API BEFORE importing userService
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

import userService from '../../services/userService';
import api from '../../services/api';

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.warn = jest.fn();
  });

  describe('getAll', () => {
    it('should return array when API returns array', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@test.com', role: 'admin' },
        { id: 2, name: 'User 2', email: 'user2@test.com', role: 'user' }
      ];

      api.get.mockResolvedValue({ data: mockUsers });

      const result = await userService.getAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('User 1');
      expect(api.get).toHaveBeenCalledWith('/users');
    });

    it('should extract array from data.data structure', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@test.com' },
        { id: 2, name: 'User 2', email: 'user2@test.com' }
      ];

      api.get.mockResolvedValue({ data: { data: mockUsers } });

      const result = await userService.getAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('User 1');
    });

    it('should extract array from cached object with numeric keys', async () => {
      const cachedData = {
        0: { id: 1, name: 'User 1', email: 'user1@test.com' },
        1: { id: 2, name: 'User 2', email: 'user2@test.com' },
        _cached: true,
        _cachedAt: '2026-02-05T12:00:00Z'
      };

      api.get.mockResolvedValue({ data: cachedData });

      const result = await userService.getAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('User 1');
    });

    it('should return empty array on error', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      const result = await userService.getAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('getById', () => {
    it('should fetch user by id', async () => {
      const mockUser = { id: 1, name: 'User 1', email: 'user1@test.com' };
      api.get.mockResolvedValue({ data: mockUser });

      const result = await userService.getById(1);

      expect(result.name).toBe('User 1');
      expect(api.get).toHaveBeenCalledWith('/users/1');
    });
  });

  describe('create', () => {
    it('should create new user', async () => {
      const newUser = { name: 'New User', email: 'new@test.com', password: 'pass123' };
      const createdUser = { id: 1, ...newUser };
      api.post.mockResolvedValue({ data: createdUser });

      const result = await userService.create(newUser);

      expect(result.id).toBe(1);
      expect(result.name).toBe('New User');
      expect(api.post).toHaveBeenCalledWith('/users', newUser);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updatedData = { name: 'Updated User' };
      const result = { id: 1, ...updatedData };
      api.put.mockResolvedValue({ data: result });

      const response = await userService.update(1, updatedData);

      expect(response.name).toBe('Updated User');
      expect(api.put).toHaveBeenCalledWith('/users/1', updatedData);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      const result = await userService.delete(1);

      expect(result.success).toBe(true);
      expect(api.delete).toHaveBeenCalledWith('/users/1');
    });
  });
});
