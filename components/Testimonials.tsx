import React from 'react';
import { Quote } from 'lucide-react';
import { Testimonial } from '../types';

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Bhuvana',
    quote: 'The attention to detail in the packaging is unmatched. It felt like opening a treasure chest!',
  },
  {
    id: 2,
    name: 'Akhila',
    quote: 'Ordered the Moonlit Luxe Hamper for my wife. She was in tears of joy. Truly premium quality.',
  },
  {
    id: 3,
    name: 'Rohith',
    quote: 'Kadaria Designs captures the essence of thoughtful gifting. Customer service was also splendid.',
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900 text-center mb-12">
          Words Of Acclaim
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-slate-800 rounded-3xl p-8 shadow-xl relative transform transition-all hover:-translate-y-2"
            >
              <div className="absolute top-6 left-6 text-emerald-400 opacity-30">
                <Quote size={48} fill="currentColor" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <p className="text-slate-300 text-lg italic leading-relaxed mb-6 font-sans">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <h4 className="text-white font-bold tracking-wide">{t.name}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;