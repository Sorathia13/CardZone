// src/test-utils.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

/**
 * Ce fichier ré-exporte les fonctions de React Testing Library
 * sans modification pour éviter les conflits avec act()
 */

// Exporter directement la fonction render de React Testing Library
export { render, screen, fireEvent, waitFor };

// Exporter act depuis React pour les cas où nous en avons besoin
export { act } from 'react';