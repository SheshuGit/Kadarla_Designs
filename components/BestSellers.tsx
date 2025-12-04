import React from 'react';
import { Product } from '../types';

import best1 from '../images/best1.png';
import bs2 from '../images/bs2.jpg';
import bs3 from '../images/bs3.png';
import bs4 from '../images/bs4.png';


const products: Product[] = [
  {
    id: 1,
    title: 'Couple Anniversary Gifts',
    price: 4999,
    image: best1,
  },
  {
    id: 2,
    title: 'Handmade designs for clothing',
    price: 5999,
    image: bs2,
  },
  {
    id: 3,
    title: 'Elegant outline Design',
    price: 2999,
    image: bs3,
  },
  {
    id: 4,
    title: 'Customized for your loved ones',
    price: 3999,
    image: bs4,
  },
];

const BestSellers: React.FC = () => {
  return (
    <section className="py-16 bg-white/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900">Best Seller</h2>
          <p className="text-slate-500 mt-3 font-medium italic">
            Discover timeless treasures that capture hearts and delight senses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-mint-100 flex flex-col group overflow-hidden cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <button className="absolute bottom-3 right-3 bg-white text-emerald-900 p-2 rounded-full shadow-md hover:bg-emerald-50 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                </button>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-serif text-lg font-semibold text-slate-800 leading-tight mb-2 line-clamp-2">
                  {product.title}
                </h3>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                  <span className="text-emerald-700 font-bold text-lg">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Best Seller
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;