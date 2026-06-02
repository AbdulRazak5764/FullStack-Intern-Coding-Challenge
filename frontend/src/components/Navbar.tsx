import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Star, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = user?.role === 'SYSTEM_ADMIN' ? '/admin'
    : user?.role === 'STORE_OWNER' ? '/owner'
    : '/dashboard';

  const roleBadgeClass: Record<string, string> = {
    SYSTEM_ADMIN: 'badge badge-admin',
    NORMAL_USER: 'badge badge-user',
    STORE_OWNER: 'badge badge-owner',
  };

  const roleLabel: Record<string, string> = {
    SYSTEM_ADMIN: 'Admin',
    NORMAL_USER: 'User',
    STORE_OWNER: 'Owner',
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo">
          <Star size={18} fill="white" color="white" />
        </div>
        <span className="navbar-name">StoreRating</span>
      </Link>

      <div className="navbar-right">
        {isAuthenticated && user ? (
          <>
            <span className="navbar-welcome">
              Hi, <strong>{user.name.split(' ')[0]}</strong>
            </span>
            <span className={roleBadgeClass[user.role] || 'badge'}>
              {roleLabel[user.role] || user.role}
            </span>
            <Link
              to={dashboardPath}
              id="nav-dashboard"
              className="btn btn-secondary btn-sm"
              title="Dashboard"
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/profile"
              id="nav-profile"
              className="btn btn-secondary btn-sm"
              title="Profile"
            >
              <UserIcon size={16} />
            </Link>
            <button
              id="nav-logout"
              onClick={handleLogout}
              className="btn btn-danger btn-sm"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" id="nav-login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" id="nav-register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
