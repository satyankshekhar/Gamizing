const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'frontend', 'src');
const directories = [
  'components',
  'pages',
  'layouts',
  'services',
  'hooks',
  'contexts',
  'routes',
  'utils'
];

directories.forEach(dir => {
  fs.mkdirSync(path.join(baseDir, dir), { recursive: true });
});

const files = {
  'index.css': `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-main: #FFFFFF;
    --bg-secondary: #F8FAFC;
    --bg-card: #FFF7ED;
    --text-primary: #1F2937;
    --text-secondary: #64748B;
    --text-muted: #94A3B8;
    --border-color: #E5E7EB;
  }

  .dark {
    --bg-main: #0B0B0B;
    --bg-secondary: #141414;
    --bg-card: #1E1E1E;
    --text-primary: #F8FAFC;
    --text-secondary: #CBD5E1;
    --text-muted: #94A3B8;
    --border-color: #2A2A2A;
  }
}

body {
  @apply bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-300;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
  `,
  'services/api.js': `
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (error.response?.data?.code === 'TOKEN_EXPIRED') {
        originalRequest._retry = true;
        try {
          const res = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
          const newAccessToken = res.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          api.defaults.headers.common['Authorization'] = \`Bearer \${newAccessToken}\`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
  `,
  'services/auth.service.js': `
import api from './api';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('accessToken');
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
  `,
  'contexts/AuthContext.jsx': `
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logout as logoutService } from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (localStorage.getItem('accessToken')) {
          const data = await getMe();
          setUser(data.user);
        }
      } catch (error) {
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const loginContext = (userData, token) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginContext, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
  `,
  'components/Navbar.jsx': `
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
}
  `,
  'components/ProtectedRoute.jsx': `
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/login" />;
}
  `,
  'pages/Landing.jsx': `
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
}
  `,
  'pages/Dashboard.jsx': `
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
}
  `,
  'pages/Login.jsx': `
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { login } from '../services/auth.service';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginContext } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login({ email, password });
      loginContext(data.user, data.accessToken);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 shadow-xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Email</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Password</label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-400 transition-colors shadow-md mt-6">
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-[var(--text-secondary)] text-sm">
          Don't have an account? <Link to="/register" className="text-orange-500 font-semibold hover:underline">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
}
  `,
  'pages/Register.jsx': `
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { register } from '../services/auth.service';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const { loginContext } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    try {
      const data = await register(formData);
      loginContext(data.user, data.accessToken);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 shadow-xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Join Gamizing</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Full Name</label>
            <input type="text" name="name" required className="w-full px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-orange-500" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Username</label>
            <input type="text" name="username" required className="w-full px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-orange-500" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Email</label>
            <input type="email" name="email" required className="w-full px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-orange-500" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Password</label>
            <input type="password" name="password" required className="w-full px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-orange-500" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Confirm Password</label>
            <input type="password" name="confirmPassword" required className="w-full px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-orange-500" onChange={handleChange} />
          </div>
          <button type="submit" className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-400 transition-colors shadow-md mt-6">
            Create Account
          </button>
        </form>
        <p className="mt-6 text-center text-[var(--text-secondary)] text-sm">
          Already have an account? <Link to="/login" className="text-orange-500 font-semibold hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
  `,
  'App.jsx': `
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </div>
        <Toaster position="bottom-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
  `,
  'main.jsx': `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// System theme detection for dark mode class
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  if (event.matches) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
  `
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(baseDir, filename), content.trim() + '\\n');
}

const tailwindConfigPath = path.join(__dirname, 'frontend', 'tailwind.config.js');
fs.writeFileSync(tailwindConfigPath, `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        orange: {
          400: '#FB923C',
          500: '#F97316'
        }
      },
      borderRadius: {
        'xl': '12px'
      }
    },
  },
  plugins: [],
}
`.trim() + '\\n');

console.log('Frontend scaffolding complete.');
