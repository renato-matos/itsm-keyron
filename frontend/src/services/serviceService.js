import api from './api';

const serviceService = {
  // Listar todos os serviços
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    
    const response = await api.get(`/services?${params.toString()}`);
    return response.data;
  },

  // Buscar serviço por ID
  getById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  // Criar novo serviço
  create: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  // Atualizar serviço
  update: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },

  // Excluir serviço
  delete: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  }
};

export default serviceService;