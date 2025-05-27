// Mock manuel de react-router-dom pour les tests
const navigate = jest.fn();

// Exporter directement les fonctions et composants mockés
export const useNavigate = jest.fn(() => navigate);
export const BrowserRouter = ({ children }) => children;
export const Routes = ({ children }) => children;
export const Route = ({ children }) => children;
export const Link = ({ children, to }) => children;
export const useParams = jest.fn(() => ({}));
export const useLocation = jest.fn(() => ({ pathname: '/' }));

// Pour les imports avec le style: import * as router from 'react-router-dom'
const reactRouterDom = {
  useNavigate,
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useLocation
};

export default reactRouterDom;