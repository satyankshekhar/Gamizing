import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center bg-[var(--bg-card)] p-12 rounded-3xl border border-[var(--border-color)] shadow-xl"
      >
        <h1 className="text-5xl font-extrabold text-orange-500 mb-2">Dashboard</h1>
        <p className="text-xl text-[var(--text-secondary)] mb-8">Authenticated Successfully, {user?.name}</p>
        <button 
          onClick={handleLogout}
          className="px-6 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] text-orange-500 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 font-bold transition-all shadow-sm hover:shadow-md"
        >
          Logout
        </button>
      </motion.div>
    </div>
  );
}\n