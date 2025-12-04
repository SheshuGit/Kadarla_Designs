import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ShoppingBag, User, Home } from 'lucide-react';
import logo from '../images/anuja_logo.png';

const Navbar: React.FC = () => {
  return (
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

          <button className="flex items-center gap-2 px-4 py-2 bg-pastel-yellow rounded-full text-amber-900 text-sm font-medium hover:bg-amber-200 transition-colors shadow-sm">
            <User size={16} />
            <span className="hidden lg:inline">Account</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;