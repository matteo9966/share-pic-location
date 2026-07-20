import { useAuth } from 'react-oidc-context';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../config/routes';

export function Navigation() {
  const auth = useAuth();
  const location = useLocation();

  const { isLoading, isAuthenticated } = auth;

  if (isLoading) {
    return null;
  }

  /**
   * Filter routes based on authentication status
   * - Unauthenticated users: only see Home
   * - Authenticated users: see Home and Dashboard (callback is hidden)
   */
  const getVisibleRoutes = () => {
    const routes: { path: string; label: string }[] = [
      { path: ROUTES.HOME, label: 'Home' },
    ];

    if (isAuthenticated) {
      routes.push({ path: ROUTES.DASHBOARD, label: 'Dashboard' });
    }

    return routes;
  };

  const visibleRoutes = getVisibleRoutes();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="px-8">
      <ul className="flex list-none m-0 p-0 gap-8">
        {visibleRoutes.map((route) => (
          <li key={route.path} className="m-0 p-0">
            <Link
              to={route.path}
              className={`inline-block px-4 py-2 rounded-sm font-medium text-white transition-all duration-300 no-underline ${
                isActive(route.path)
                  ? 'border-b-2 border-blue-600 text-blue-300'
                  : 'hover:bg-black/10'
              }`}
            >
              {route.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
