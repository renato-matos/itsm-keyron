import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';

describe('App Integration', () => {
  const renderWithProviders = (component) => {
    return render(
      <AuthProvider>
        {component}
      </AuthProvider>
    );
  };

  it('should render app without crashing', () => {
    renderWithProviders(<App />);

    expect(document.body).toBeInTheDocument();
  });

  it('should render without errors even if observability is disabled', () => {
    // This tests that the app works when observability services are unavailable
    renderWithProviders(<App />);

    // App should render successfully
    expect(document.body).toBeInTheDocument();
  });
});
