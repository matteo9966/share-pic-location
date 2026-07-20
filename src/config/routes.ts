import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Auth from '../pages/Auth';

/**
 * Route paths constants
 * Use these throughout the app instead of hardcoding paths
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CALLBACK: '/callback',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
} as const;

/**
 * Route definitions for the router
 * Each route includes the path and its corresponding component
 */
export const routeDefinitions = [
  {
    path: ROUTES.HOME,
    element: Home,
    label: 'Home',
  },
  {
    path: ROUTES.DASHBOARD,
    element: Dashboard,
    label: 'Dashboard',
  },
  {
    path: ROUTES.CALLBACK,
    element: Auth,
    label: 'Auth Callback',
  },
] as const;
