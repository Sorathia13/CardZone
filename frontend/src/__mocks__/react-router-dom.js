// Mock manuel de react-router-dom pour les tests
const React = require('react');

// Créer une fonction mock qui persiste entre les tests
const mockNavigate = jest.fn();

const reactRouterDom = {
  ...jest.requireActual('react-router-dom'),
  // Mock pour useNavigate - retourne toujours la même fonction mock
  useNavigate: () => mockNavigate,
  
  // Mock pour BrowserRouter
  BrowserRouter: ({ children }) => children,
  
  // Mock pour Routes
  Routes: ({ children }) => children,
  
  // Mock pour Route
  Route: ({ children }) => children,
  
  // Mock pour Link
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,

  // Mock pour NavLink
  NavLink: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,

  // Mock pour useParams
  useParams: () => ({}),

  // Mock pour useLocation
  useLocation: () => ({ 
    pathname: '/',
    search: '',
    hash: '',
    state: null
  })
};

// Exporter mockNavigate pour permettre aux tests de le réinitialiser
reactRouterDom.__mockNavigate = mockNavigate;

module.exports = reactRouterDom;