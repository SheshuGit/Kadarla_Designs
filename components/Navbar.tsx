import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, LogIn, Home, User, LogOut, ChevronDown, Package } from 'lucide-react';
import logo from '../images/anuja_logo.png';
import LoginModal from './LoginModal';
import { getUser, authAPI, cartAPI, itemsAPI, User as UserType, Item } from '../utils/api';

const Navbar: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load all items for search
  useEffect(() => {
    loadAllItems();
  }, []);

  // Check if user is logged in on component mount
  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser) {
      loadCartCount();
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAllItems = async () => {
    try {
      const items = await itemsAPI.getItems(undefined, true); // Get only active items
      setAllItems(items);
    } catch (error) {
      console.error('Error loading items for search:', error);
    }
  };

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (user) {
        loadCartCount();
      }
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [user]);

  const loadCartCount = async () => {
    if (!user) return;
    try {
      const cart = await cartAPI.getCart(user.id);
      setCartItemCount(cart.itemCount);
    } catch (error) {
      console.error('Error loading cart count:', error);
      setCartItemCount(0);
    }
  };

  // Update user state when login modal closes
  useEffect(() => {
    if (!isLoginModalOpen) {
      const currentUser = getUser();
      setUser(currentUser);
      if (currentUser) {
        loadCartCount();
      } else {
        setCartItemCount(0);
      }
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

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      // Filter items based on search query
      const filtered = allItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (itemId: string) => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate(`/product/${itemId}`);
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length > 0) {
      setShowSuggestions(false);
      // Navigate to search results page or category page with search query
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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
          <div className="w-full md:max-w-md relative" ref={searchRef}>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-emerald-500 z-10">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search Gifts"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchSubmit}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 shadow-sm placeholder-emerald-300 transition-all"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-emerald-100 overflow-hidden z-50 max-h-96 overflow-y-auto">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSuggestionClick(item.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 transition-colors text-left border-b border-emerald-50 last:border-b-0"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-emerald-100">
                      <img
                        src={`data:${item.imageType || 'image/jpeg'};base64,${item.image}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-900 truncate">{item.title}</p>
                      <p className="text-xs text-emerald-600 truncate">{item.category}</p>
                      <p className="text-xs font-bold text-emerald-700 mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* No results message */}
            {showSuggestions && searchQuery.trim().length > 0 && suggestions.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-emerald-100 p-4 z-50">
                <p className="text-sm text-emerald-600 text-center">No items found matching "{searchQuery}"</p>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-emerald-900 text-sm font-medium hover:bg-emerald-200 transition-colors shadow-sm">
              <Home size={16} />
              <span className="hidden lg:inline">Home</span>
            </Link>
            <Link 
              to="/favorites"
              className="flex items-center gap-2 px-4 py-2 bg-pastel-pink rounded-full text-pink-900 text-sm font-medium hover:bg-pink-200 transition-colors shadow-sm"
            >
              <Heart size={16} />
              <span className="hidden lg:inline">Favorites</span>
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-4 py-2 bg-pastel-pink rounded-full text-pink-900 text-sm font-medium hover:bg-pink-200 transition-colors shadow-sm"
            >
              <ShoppingBag size={16} />
              <span className="hidden lg:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
            {user && (
              <Link
                to="/orders"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-emerald-900 text-sm font-medium hover:bg-emerald-200 transition-colors shadow-sm whitespace-nowrap"
              >
                <Package size={16} />
                <span className="hidden lg:inline whitespace-nowrap">My Orders</span>
              </Link>
            )}

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