import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>Dashboard - Sistema ITSM</h1>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Sair
        </button>
      </header>
      
      <div>
        <h2>Bem-vindo ao Sistema ITSM!</h2>
        <p>Aqui você pode gerenciar usuários e serviços.</p>
        
        <div style={{ marginTop: '30px' }}>
          <h3>Funcionalidades disponíveis:</h3>
          <ul>
            <li>Gerenciamento de Usuários</li>
            <li>Catálogo de Serviços</li>
            <li>Autenticação JWT</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;