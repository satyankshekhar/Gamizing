import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 text-xl font-extrabold">
        <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
        Gamizing
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="font-semibold text-orange-500 mr-4">Lvl {user.level}</span>
            <Link to="/dashboard" className="font-medium text-[var(--text-secondary)] hover:text-orange-500 transition-colors">Dashboard</Link>
            <button onClick={handleLogout} className="px-4 py-2 border border-[var(--border-color)] text-orange-500 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/20 font-semibold transition-all">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="font-medium text-[var(--text-secondary)] hover:text-orange-500 transition-colors">Login</Link>
            <Link to="/register" className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-400 shadow-md font-semibold transition-all hover:-translate-y-0.5">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}\n