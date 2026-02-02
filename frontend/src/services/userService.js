import api from './api';

const userService = {
  // Listar todos os usuários
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
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