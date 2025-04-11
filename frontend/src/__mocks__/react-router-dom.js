// Mock de react-router-dom pour les tests
const reactRouterDom = jest.createMockFromModule('react-router-dom');

// Mock pour useNavigate
reactRouterDom.useNavigate = jest.fn(() => jest.fn());

// Mock pour BrowserRouter
reactRouterDom.BrowserRouter = ({ children }) => children;

// Mock pour Routes
reactRouterDom.Routes = ({ children }) => children;

// Mock pour Route
reactRouterDom.Route = ({ children }) => children;

// Mock pour Link
reactRouterDom.Link = ({ children, to }) => children;

module.exports = reactRouterDom;