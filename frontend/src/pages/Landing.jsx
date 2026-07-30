import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Level Up Your <span className="text-orange-500">Experience</span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] mb-10">
          Join the ultimate 2D multiplayer battleground. Compete with players worldwide, earn rewards, and climb to the top of the leaderboard.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register" className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-400 shadow-lg shadow-orange-500/20 font-bold text-lg transition-all hover:-translate-y-1">
            Start Journey
          </Link>
          <Link to="/login" className="px-8 py-3 border-2 border-[var(--border-color)] text-orange-500 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/10 font-bold text-lg transition-all">
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}\n