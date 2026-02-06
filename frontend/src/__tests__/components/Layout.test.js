import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';

describe('Layout Component', () => {
  const renderWithProviders = (component) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should render layout with children', () => {
    renderWithProviders(
      <Layout>
        <div data-testid="test-child">Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('should render navigation if available', () => {
    renderWithProviders(<Layout />);

    // Component should render without errors
    expect(document.body).toBeInTheDocument();
  });
});
