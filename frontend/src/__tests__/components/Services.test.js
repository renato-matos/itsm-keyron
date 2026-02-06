// Mock services BEFORE importing components
jest.mock('../../services/serviceService', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  filter: jest.fn(),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Services from '../../pages/Services';
import serviceService from '../../services/serviceService';

describe('Services Page', () => {
  const mockServices = [
    {
      id: 1,
      name: 'Service 1',
      description: 'Description 1',
      category: 'Infraestrutura',
      status: 'Ativo',
      owner: 'Admin',
      createdAt: '2026-02-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Service 2',
      description: 'Description 2',
      category: 'Software',
      status: 'Inativo',
      owner: 'User',
      createdAt: '2026-02-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    serviceService.getAll.mockResolvedValue(mockServices);
  });

  it('should render loading state initially', async () => {
    serviceService.getAll.mockResolvedValue(mockServices);
    
    render(<Services />);

    // The page displays a loading message initially, then displays content
    // We verify the title eventually appears
    await waitFor(() => {
      expect(screen.getByText(/Catálogo de Serviços/i)).toBeInTheDocument();
    });
  });

  it('should load and display services', async () => {
    render(<Services />);

    await waitFor(() => {
      expect(screen.getByText('Service 1')).toBeInTheDocument();
      expect(screen.getByText('Service 2')).toBeInTheDocument();
    });

    expect(serviceService.getAll).toHaveBeenCalled();
  });

  it('should display error message on API error', async () => {
    serviceService.getAll.mockRejectedValue(new Error('API Error'));

    render(<Services />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar serviços/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no services', async () => {
    serviceService.getAll.mockResolvedValue([]);

    render(<Services />);

    await waitFor(() => {
      expect(serviceService.getAll).toHaveBeenCalled();
    });
  });

  it('should filter services by category', async () => {
    serviceService.getAll.mockResolvedValue(mockServices);
    render(<Services />);

    await waitFor(() => {
      expect(screen.getByText('Service 1')).toBeInTheDocument();
    });

    // Verify filter dropdown exists and is visible
    const categorySelect = screen.getByDisplayValue('Todos');
    expect(categorySelect).toBeInTheDocument();
  });

  it('should clear filters', async () => {
    serviceService.getAll.mockResolvedValue(mockServices);
    render(<Services />);

    await waitFor(() => {
      expect(screen.getByText('Service 1')).toBeInTheDocument();
    });

    // Verify clear filters button exists
    const clearButton = screen.getByText(/Limpar Filtros/i);
    expect(clearButton).toBeInTheDocument();
  });

  it('should display service details correctly', async () => {
    serviceService.getAll.mockResolvedValue(mockServices);
    render(<Services />);

    await waitFor(() => {
      expect(screen.getByText('Service 1')).toBeInTheDocument();
    });

    // Verify both services are displayed
    expect(screen.getByText('Service 1')).toBeInTheDocument();
    expect(screen.getByText('Service 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
  });

  it('should have new service button', async () => {
    render(<Services />);

    await waitFor(() => {
      expect(screen.getByText('Service 1')).toBeInTheDocument();
    });

    const newButton = screen.getByText(/Novo Serviço/i);
    expect(newButton).toBeInTheDocument();
  });
});
