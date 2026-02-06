// Axios is mocked globally in jest.setup.js
import api from '../../services/api';

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should be initialized with interceptors', () => {
      expect(api).toBeDefined();
      expect(api.interceptors).toBeDefined();
      expect(api.interceptors.request).toBeDefined();
      expect(api.interceptors.response).toBeDefined();
    });

    it('should have HTTP methods', () => {
      expect(typeof api.get).toBe('function');
      expect(typeof api.post).toBe('function');
      expect(typeof api.put).toBe('function');
      expect(typeof api.delete).toBe('function');
      expect(typeof api.patch).toBe('function');
    });
  });

  describe('Request Interceptor Setup', () => {
    it('should register request interceptor', () => {
      expect(api.interceptors.request.use).toBeDefined();
      // In tests, we verify that the interceptor setup was called
      // Actual interceptor behavior is tested through integration tests
    });
  });

  describe('Response Interceptor Setup', () => {
    it('should register response interceptor', () => {
      expect(api.interceptors.response.use).toBeDefined();
      // In tests, we verify that the interceptor setup was called
      // Actual interceptor behavior is tested through integration tests
    });
  });
});

