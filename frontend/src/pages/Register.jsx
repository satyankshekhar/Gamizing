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
}\n