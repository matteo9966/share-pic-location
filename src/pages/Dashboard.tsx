import { useAuth } from "../providers/AuthProvider";
import User from "../components/User";

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Please log in to view the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <User user={user} />
    </div>
  );
}

export default Dashboard;
