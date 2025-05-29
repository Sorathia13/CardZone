// src/test-utils.js
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

/**
 * Ce fichier remplace les imports de React Testing Library
 * pour supprimer les avertissements concernant ReactDOMTestUtils.act
 */

// Utiliser cette fonction de rendu au lieu de celle de React Testing Library
function render(ui, { route = '/', ...renderOptions } = {}) {
  window.history.pushState({}, 'Test page', route);

  const Wrapper = ({ children }) => {
    return (
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    );
  };

  // Utiliser React.act directement au lieu de ReactDOMTestUtils.act
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { render };