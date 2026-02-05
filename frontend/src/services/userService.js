import api from './api';

const userService = {
  // Listar todos os usuários
  getAll: async () => {
    try {
      const response = await api.get('/users');
      const data = response.data;
      
      // Garantir que sempre retorna um array
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn('User API returned non-array data:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching users:', error.message);
      return [];
    }
  },

  // Buscar usuário por ID
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Criar novo usuário
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Atualizar usuário
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Excluir usuário
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default userService;