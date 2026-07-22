import { useAuth } from '../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { Navigation } from './Navigation';

export function Header() {
  const auth = useAuth();
  const navigate = useNavigate();

  // Destructure auth states
  const { isLoading, isAuthenticated, user } = auth;

  // Handle login
  const handleLogin = () => {
    auth.signinRedirect();
  };

  // Handle logout
  const handleLogout = () => {
    auth.removeUser();
    navigate(ROUTES.HOME);
  };

  // Show loading state
  if (isLoading) {
    return (
      <header className="sticky top-0 z-10 bg-blue-900 text-white shadow-md">
        <div className="mx-auto max-w-5xl px-4 py-4 flex flex-col gap-4">
          <h1 className="text-2xl">Cats around the world</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-300">Loading...</p>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-100 bg-blue-900 text-white shadow-md">
      <div className="mx-auto max-w-5xl px-4 py-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-2 md:gap-4">
          <h1 
            onClick={() => navigate(ROUTES.HOME)} 
            className="m-0 text-2xl cursor-pointer transition-opacity duration-300 hover:opacity-80"
          >
            Cats around the world
          </h1>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm">
                  {user?.profile?.given_name || user?.profile?.email || 'User'}
                </span>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded transition-all duration-300 hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="px-4 py-2 bg-sky-400 text-white text-sm font-medium rounded transition-all duration-300 hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Login
              </button>
            )}
          </nav>
        </div>
        <Navigation />
      </div>
    </header>
  );
}
