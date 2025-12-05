import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Try login with email/username and password
      // Backend will check admin credentials first, then user credentials
      const response = await authAPI.login(email, password, email);
      
      // Check if it's an admin login
      if (response.isAdmin) {
        onClose();
        // Redirect to admin dashboard
        navigate('/admin');
      } else {
        // Regular user login
        onClose();
        // Call the success callback if provided, otherwise reload
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.reload();
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-br from-mint-50 via-white to-pastel-pink rounded-3xl shadow-2xl transform transition-all animate-slideUp border border-emerald-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-emerald-700 transition-all hover:scale-110 shadow-md z-10"
        >
          <X size={20} />
        </button>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-yellow rounded-full -mr-16 -mt-16 opacity-30 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-pastel-blue rounded-full -ml-12 -mb-12 opacity-30 blur-2xl"></div>

        {/* Content */}
        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mb-4 shadow-lg">
              <Sparkles className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-emerald-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-emerald-600 text-sm">
              Sign in to continue your journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email/Username Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-emerald-900 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="text-emerald-400" size={20} />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com or username"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-emerald-100 rounded-xl text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-emerald-900 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="text-emerald-400" size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-emerald-100 rounded-xl text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-emerald-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-mint-50 to-white text-emerald-600">
                New to Kadarla Designs?
              </span>
            </div>
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegisterClick}
            className="w-full py-3.5 bg-white border-2 border-emerald-300 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 hover:border-emerald-400 transform hover:scale-[1.02] transition-all duration-200 shadow-sm"
          >
            Create New Account
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginModal;

