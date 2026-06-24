import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminDashboardPage = () => {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-[#1A1A1A] text-[#F5F5F5]">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-8 text-[#FFB800]">Admin Panel</h2>
          <nav className="space-y-4">
            <Link to="/admin/menu" className="block text-lg hover:text-[#FFB800] transition-colors duration-200">
              Manage Menu
            </Link>
            <Link to="/admin/reservations" className="block text-lg hover:text-[#FFB800] transition-colors duration-200">
              Manage Reservations
            </Link>
            <Link to="/admin/events" className="block text-lg hover:text-[#FFB800] transition-colors duration-200">
              Manage Events
            </Link>
          </nav>
        </div>
        <button
          onClick={logout}
          className="w-full py-2 px-4 bg-red-600 text-[#F5F5F5] rounded-md hover:bg-red-700 transition-colors duration-200"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>
        <p className="text-lg">
          Welcome to the Filament Bar administration panel. Select an option from the sidebar to get started.
        </p>
      </main>
    </div>
  );
};

export default AdminDashboardPage;