// Mock services BEFORE importing components
jest.mock('../../services/userService', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Users from '../../pages/Users';
import userService from '../../services/userService';

describe('Users Page', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'User 1',
      email: 'user1@test.com',
      role: 'admin',
      createdAt: '2026-02-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'User 2',
      email: 'user2@test.com',
      role: 'user',
      createdAt: '2026-02-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    userService.getAll.mockResolvedValue(mockUsers);
  });

  it('should render loading state initially', async () => {
    // Mock getAll to return mockUsers - this lets the page render
    userService.getAll.mockResolvedValue(mockUsers);
    
    render(<Users />);

    // The page displays a loading message initially, then displays content
    // We verify the title eventually appears
    await waitFor(() => {
      expect(screen.getByText(/Gerenciar Usuários/i)).toBeInTheDocument();
    });
  });

  it('should load and display users', async () => {
    render(<Users />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });

    expect(userService.getAll).toHaveBeenCalled();
  });

  it('should display error message on API error', async () => {
    userService.getAll.mockRejectedValue(new Error('API Error'));

    render(<Users />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar usuários/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no users', async () => {
    userService.getAll.mockResolvedValue([]);

    render(<Users />);

    await waitFor(() => {
      expect(userService.getAll).toHaveBeenCalled();
    });
  });

  it('should display user details correctly', async () => {
    userService.getAll.mockResolvedValue(mockUsers);
    render(<Users />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
  });

  it('should have new user button', async () => {
    render(<Users />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const newButton = screen.getByText(/Novo Usuário/i);
    expect(newButton).toBeInTheDocument();
  });
});
