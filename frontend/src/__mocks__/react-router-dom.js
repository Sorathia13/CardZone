// Mock manuel de react-router-dom pour les tests
const navigate = jest.fn();

const reactRouterDom = {
  // Mock pour useNavigate - retourne toujours une fonction
  useNavigate: jest.fn(() => navigate),
  
  // Mock pour BrowserRouter
  BrowserRouter: ({ children }) => children,
  
  // Mock pour Routes
  Routes: ({ children }) => children,
  
  // Mock pour Route
  Route: ({ children }) => children,
  
  // Mock pour Link
  Link: ({ children, to }) => children,

  // Mock pour useParams
  useParams: jest.fn(() => ({})),

  // Mock pour useLocation
  useLocation: jest.fn(() => ({ pathname: '/' }))
};

module.exports = reactRouterDom;