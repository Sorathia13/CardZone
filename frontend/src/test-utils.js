// src/test-utils.js
import React from 'react';
import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';

/**
 * Ce fichier remplace les imports de React Testing Library
 * pour supprimer les avertissements concernant ReactDOMTestUtils.act
 */

// Utiliser cette fonction de rendu au lieu de celle de React Testing Library
function render(ui, options) {
  let result;
  act(() => {
    result = rtlRender(ui, options);
  });
  return result;
}

// Exporter les fonctions nécessaires pour les tests
export { screen, fireEvent, waitFor, act };

// Remplacer la fonction render par notre version
export { render };