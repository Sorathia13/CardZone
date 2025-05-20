// Mock manuel de react-router-dom pour les tests
const reactRouterDom = {
  // Mock pour useNavigate
  useNavigate: jest.fn(() => jest.fn()),
  
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