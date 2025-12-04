import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ShoppingBag, LogIn, Home, Shield, User, LogOut, ChevronDown } from 'lucide-react';
import logo from '../images/anuja_logo.png';
import LoginModal from './LoginModal';
import { getUser, authAPI, User as UserType } from '../utils/api';

const Navbar: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in on component mount
  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  // Update user state when login modal closes
  useEffect(() => {
    if (!isLoginModalOpen) {
      const currentUser = getUser();
      setUser(currentUser);
    }
  }, [isLoginModalOpen]);

  // Listen for storage changes (when user logs in from another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = getUser();
      setUser(currentUser);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
    window.location.reload(); // Refresh to update UI
  };

  const handleLoginSuccess = () => {
    const currentUser = getUser();
    setUser(currentUser);
    setIsLoginModalOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-mint-50/95 backdrop-blur-sm border-b border-mint-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Brand */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <img
              src={logo}
              alt="Kadarla Designs Logo"
              className="w-20 h-20 rounded-full object-cover border-2 border-emerald-100 shadow-sm"
            />
            <h1 className="text-2xl font-serif font-bold text-emerald-900 tracking-wide uppercase">
              Kadarla Designs
            </h1>
          </div>

          {/* Center: Search */}
          <div className="w-full md:max-w-md relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-emerald-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search Gifts"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 shadow-sm placeholder-emerald-300 transition-all"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-emerald-900 text-sm font-medium hover:bg-emerald-200 transition-colors shadow-sm">
              <Home size={16} />
              <span className="hidden lg:inline">Home</span>
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-pastel-blue rounded-full text-sky-900 text-sm font-medium hover:bg-sky-200 transition-colors shadow-sm">
              <MapPin size={16} />
              <span className="hidden lg:inline">Location</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-pastel-pink rounded-full text-pink-900 text-sm font-medium hover:bg-pink-200 transition-colors shadow-sm">
              <ShoppingBag size={16} />
              <span className="hidden lg:inline">Cart</span>
            </button>

            {/* User Menu or Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full text-white text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <User size={16} />
                  <span className="hidden lg:inline">{user.fullName.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-emerald-100 overflow-hidden z-50 animate-slideDown">
                      <div className="p-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-mint-50">
                        <p className="text-sm font-semibold text-emerald-900">{user.fullName}</p>
                        <p className="text-xs text-emerald-600 truncate">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full text-white text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <LogIn size={16} />
                <span className="hidden lg:inline">Login</span>
              </button>
            )}

            <Link 
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Shield size={16} />
              <span className="hidden lg:inline">Admin</span>
            </Link>
          </div>
        </div>
      </nav>
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;