import React from 'react';
import logo from '../images/anu_img.png';

const Hero: React.FC = () => {
  return (
    <section className="w-full max-w-7xl mx-auto mt-6 px-4 md:px-6">
      <div className="relative w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-lg group">
        <img
          src={logo}
          alt="Artisanal Gifts"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-transparent flex items-center pl-8 md:pl-16">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl max-w-[260px] transform transition-all hover:-translate-y-1">
            <h2 className="text-xl font-serif font-bold text-emerald-900 mb-1">
              Handcrafted Joy
            </h2>
            <p className="text-slate-400 text-xs mb-3 font-medium">
              Wrap your love in our artisanal threads and custom boxes.
            </p>
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all">
              Explore Collection
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;