import React, { useState, useEffect, useCallback } from 'react';
import serviceService from '../services/serviceService';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: ''
  });

  // Opções para filtros
  const categories = ['Infraestrutura', 'Software', 'Hardware', 'Suporte', 'Geral'];
  const statuses = ['Ativo', 'Inativo', 'Em Manutenção'];

  // Carregar serviços - usar useCallback para evitar recriação desnecessária
  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Carregando serviços com filtros:', filters);
      const data = await serviceService.getAll(filters);
      console.log('Serviços carregados:', data);
      // Garantir que data é um array
      const servicesArray = Array.isArray(data) ? data : [];
      setServices(servicesArray);
      setError('');
    } catch (error) {
      setError('Erro ao carregar serviços');
      console.error('Erro:', error);
      setServices([]); // Usar array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Disparar no mount e quando filters mudarem
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Excluir serviço
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await serviceService.delete(id);
        loadServices(); // Recarregar lista
        alert('Serviço excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir serviço');
        console.error('Erro:', error);
      }
    }
  };

  // Abrir formulário para edição
  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  // Abrir formulário para novo serviço
  const handleNew = () => {
    setEditingService(null);
    setShowForm(true);
  };

  // Fechar formulário
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingService(null);
    loadServices(); // Recarregar lista
  };

  // Filtros
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({ category: '', status: '' });
  };

  // Badge de status
  const getStatusBadge = (status) => {
    const colors = {
      'Ativo': '#28a745',
      'Inativo': '#6c757d',
      'Em Manutenção': '#ffc107'
    };
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: status === 'Em Manutenção' ? '#000' : '#fff',
        backgroundColor: colors[status] || '#6c757d'
      }}>
        {status}
      </span>
    );
  };

  if (loading) return <div>Carregando serviços...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2>Catálogo de Serviços</h2>
        <button 
          onClick={handleNew}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Novo Serviço
        </button>
      </div>

      {/* Filtros */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Filtros</h4>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: '8px' }}>Categoria:</label>
            <select 
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              style={{ 
                padding: '6px 10px', 
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Todas</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ marginRight: '8px' }}>Status:</label>
            <select 
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              style={{ 
                padding: '6px 10px', 
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Todos</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={clearFilters}
            style={{ 
              padding: '6px 12px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Lista de serviços */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Nome</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Categoria</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Responsável</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Criado em</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{service.id}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                  <div>
                    <strong>{service.name}</strong>
                    {service.description && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {service.description.length > 50 
                          ? `${service.description.substring(0, 50)}...` 
                          : service.description
                        }
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{service.category}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                  {getStatusBadge(service.status)}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{service.owner}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                  {new Date(service.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleEdit(service)}
                    style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '3px',
                      marginRight: '5px'
                    }}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id)}
                    style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#dc3545', 
                      color: 'white', 
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '3px'
                    }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {services.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {filters.category || filters.status 
            ? 'Nenhum serviço encontrado com os filtros aplicados'
            : 'Nenhum serviço cadastrado'
          }
        </div>
      )}

      {/* Formulário Modal */}
      {showForm && (
        <ServiceForm 
          service={editingService} 
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

// Componente do formulário
const ServiceForm = ({ service, onClose }) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || 'Geral',
    status: service?.status || 'Ativo',
    owner: service?.owner || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Infraestrutura', 'Software', 'Hardware', 'Suporte', 'Geral'];
  const statuses = ['Ativo', 'Inativo', 'Em Manutenção'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (service) {
        // Editar serviço existente
        await serviceService.update(service.id, formData);
        alert('Serviço atualizado com sucesso!');
      } else {
        // Criar novo serviço
        await serviceService.create(formData);
        alert('Serviço criado com sucesso!');
      }
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao salvar serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3>{service ? 'Editar Serviço' : 'Novo Serviço'}</h3>

        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Nome do Serviço:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Descrição:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Categoria:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Status:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Responsável:</label>
            <input
              type="text"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button"
              onClick={onClose}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: '4px'
              }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Services;