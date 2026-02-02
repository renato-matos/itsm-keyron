import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#343a40', 
        color: 'white', 
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Sistema ITSM</h1>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Sair
        </button>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <nav style={{ 
          width: '250px', 
          backgroundColor: 'white', 
          minHeight: 'calc(100vh - 80px)',
          padding: '20px 0',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '5px' }}>
              <Link 
                to="/dashboard" 
                style={{ 
                  display: 'block',
                  padding: '12px 20px', 
                  textDecoration: 'none', 
                  color: isActive('/dashboard') ? '#007bff' : '#333',
                  backgroundColor: isActive('/dashboard') ? '#e3f2fd' : 'transparent',
                  borderRight: isActive('/dashboard') ? '3px solid #007bff' : 'none'
                }}
              >
                📊 Dashboard
              </Link>
            </li>
            <li style={{ marginBottom: '5px' }}>
              <Link 
                to="/users" 
                style={{ 
                  display: 'block',
                  padding: '12px 20px', 
                  textDecoration: 'none', 
                  color: isActive('/users') ? '#007bff' : '#333',
                  backgroundColor: isActive('/users') ? '#e3f2fd' : 'transparent',
                  borderRight: isActive('/users') ? '3px solid #007bff' : 'none'
                }}
              >
                👥 Usuários
              </Link>
            </li>
            <li style={{ marginBottom: '5px' }}>
              <Link 
                to="/services" 
                style={{ 
                  display: 'block',
                  padding: '12px 20px', 
                  textDecoration: 'none', 
                  color: isActive('/services') ? '#007bff' : '#333',
                  backgroundColor: isActive('/services') ? '#e3f2fd' : 'transparent',
                  borderRight: isActive('/services') ? '3px solid #007bff' : 'none'
                }}
              >
                🛠️ Serviços
              </Link>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <main style={{ 
          flex: 1, 
          padding: '20px',
          backgroundColor: '#f8f9fa',
          minHeight: 'calc(100vh - 80px)'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;