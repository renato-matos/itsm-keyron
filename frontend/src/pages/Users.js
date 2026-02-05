import React, { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Carregar usuários - usar useCallback para evitar recriação desnecessária
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      // Garantir que data é um array
      const usersArray = Array.isArray(data) ? data : [];
      setUsers(usersArray);
      setError('');
    } catch (error) {
      setError('Erro ao carregar usuários');
      console.error('Erro:', error);
      setUsers([]); // Usar array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Excluir usuário
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await userService.delete(id);
        loadUsers(); // Recarregar lista
        alert('Usuário excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir usuário');
        console.error('Erro:', error);
      }
    }
  };

  // Abrir formulário para edição
  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  // Abrir formulário para novo usuário
  const handleNew = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  // Fechar formulário
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
    loadUsers(); // Recarregar lista
  };

  if (loading) return <div>Carregando usuários...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2>Gerenciar Usuários</h2>
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
          Novo Usuário
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Lista de usuários */}
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
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Criado em</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{user.id}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{user.name}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{user.email}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleEdit(user)}
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
                    onClick={() => handleDelete(user.id)}
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

      {users.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Nenhum usuário encontrado
        </div>
      )}

      {/* Formulário Modal */}
      {showForm && (
        <UserForm 
          user={editingUser} 
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

// Componente do formulário (será criado a seguir)
const UserForm = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (user) {
        // Editar usuário existente
        const updateData = {
          name: formData.name,
          email: formData.email
        };
        // Só incluir senha se foi preenchida
        if (formData.password) {
          updateData.password = formData.password;
        }
        await userService.update(user.id, updateData);
        alert('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        await userService.create(formData);
        alert('Usuário criado com sucesso!');
      }
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao salvar usuário');
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3>{user ? 'Editar Usuário' : 'Novo Usuário'}</h3>

        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Nome:</label>
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
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
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

          <div style={{ marginBottom: '20px' }}>
            <label>Senha {user ? '(deixe em branco para manter a atual)' : ''}:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!user} // Obrigatório apenas para novo usuário
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

export default Users;