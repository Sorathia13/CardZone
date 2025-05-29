// Mock manuel de react-router-dom pour les tests
const React = require('react');

// Créer une fonction mock qui persiste entre les tests
const mockNavigate = jest.fn();

const reactRouterDom = {
  // Mock pour useNavigate - retourne toujours la même fonction mock
  useNavigate: jest.fn(() => mockNavigate),
  
  // Mock pour BrowserRouter
  BrowserRouter: ({ children }) => children,
  
  // Mock pour Routes
  Routes: ({ children }) => children,
  
  // Mock pour Route
  Route: ({ children }) => children,
  
  // Mock pour Link
  Link: ({ children, to, ...props }) => {
    return React.createElement('a', { href: to, ...props }, children);
  },

  // Mock pour useParams
  useParams: jest.fn(() => ({})),

  // Mock pour useLocation
  useLocation: jest.fn(() => ({ pathname: '/' })),

  // Exporter mockNavigate pour pouvoir le réinitialiser dans les tests
  __mockNavigate: mockNavigate
};

module.exports = reactRouterDom;