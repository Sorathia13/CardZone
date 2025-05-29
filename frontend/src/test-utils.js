// src/test-utils.js
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { act } from 'react';
import { AuthProvider } from './context/AuthContext';

/**
 * Ce fichier remplace les imports de React Testing Library
 * pour supprimer les avertissements concernant ReactDOMTestUtils.act
 */

// Utiliser cette fonction de rendu au lieu de celle de React Testing Library
function render(ui, options = {}) {
  const {
    initialEntries = ['/'],
    ...renderOptions
  } = options;

  let result;
  act(() => {
    result = rtlRender(ui, renderOptions);
  });
  return result;
}

// Custom render function with AuthProvider
export function renderWithAuth(ui, options = {}) {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>,
    options
  );
}

// re-export everything
export * from '@testing-library/react';
export { render };