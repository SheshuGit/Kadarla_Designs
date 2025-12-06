import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import logo from '../images/anuja_logo.png';

const Whatsapp = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="pt-12 pb-8 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Block 1: Brand */}
        <div className="bg-pastel-pink rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[200px] hover:shadow-md transition-shadow">
          <img
            src={logo}
            alt="Kadaria Designs Logo"
            className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md mb-4"
          />
          <h2 className="text-2xl font-serif font-bold text-pink-900 mb-2">KADARLA DESIGNS</h2>
          <p className="text-pink-800 text-sm">Handcrafted with love.</p>
        </div>

        {/* Block 2: Contact */}
        <div className="bg-pastel-blue rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[200px] hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-sky-900 mb-4">Contact Us</h3>
          <div className="flex flex-col gap-3 text-sky-800 text-sm">
            <div className="flex items-center gap-2">
              <Phone size={16} /> <span>+91 81061 61717</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail href="mailto:kadarlaanuja1005@gmail.com" size={16} /> <span>kadarlaanuja1005@gmail.com</span>
            </div>
          </div>  
        </div>

        {/* Block 3: Location */}
        <div className="bg-pastel-yellow rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[200px] hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-amber-900 mb-4">Visit Us</h3>
          <div className="flex flex-col gap-2 items-center text-amber-800 text-sm">
            <MapPin size={24} className="mb-2" />
            <p>Pochamaidam,<br /> Warangal, India</p>
          </div>
        </div>

        {/* Block 4: Social */}
        <div className="bg-pastel-purple rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[200px] hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-purple-900 mb-6">Follow Us</h3>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/kadarladesigns?utm_source=qr&igsh=OWNycTVxNWsxNHhz" className="p-3 bg-white/50 rounded-full text-purple-900 hover:bg-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href="https://wa.me/918106161717" className="p-3 bg-white/50 rounded-full text-purple-900 hover:bg-white transition-colors">
              <Whatsapp size={20} />
            </a>
            <a href="#" className="p-3 bg-white/50 rounded-full text-purple-900 hover:bg-white transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-emerald-800/60 text-sm font-medium">
        © {new Date().getFullYear()} Kadarla Designs. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;