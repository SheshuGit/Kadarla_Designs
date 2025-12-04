import React from 'react';
import { 
  Cake, Heart, Home, Gift, Baby, Star, Plane, 
  Stethoscope, Gem 
} from 'lucide-react';
import { Occasion } from '../types';

const occasions: Occasion[] = [
  { id: 1, label: 'Birthday', iconName: 'Cake' },
  { id: 2, label: 'Anniversary', iconName: 'Heart' },
  { id: 3, label: 'Housewarming', iconName: 'Home' },
  { id: 4, label: 'Wedding', iconName: 'Gift' },
  { id: 5, label: 'Baby Shower', iconName: 'Baby' },
  { id: 6, label: 'Congratulations', iconName: 'Star' },
  { id: 7, label: 'Farewell', iconName: 'Plane' },
  { id: 8, label: 'Get Well Soon', iconName: 'Stethoscope' },
  { id: 9, label: 'Proposal', iconName: 'Gem' },
];

const IconMap: Record<string, React.FC<any>> = {
  Cake, Heart, Home, Gift, Baby, Star, Plane, Stethoscope, Gem
};

const Occasions: React.FC = () => {
  return (
    <section className="py-20 max-w-5xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900">What’s the Occasion?</h2>
        <p className="text-slate-500 mt-2 font-medium">Elevate every moment with thoughtful gifting options.</p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-3 gap-y-12 gap-x-6 justify-items-center">
        {occasions.map((item) => {
          const IconComponent = IconMap[item.iconName];
          return (
            <div key={item.id} className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-pastel-yellow group-hover:bg-pastel-pink flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-2 border-4 border-white">
                {IconComponent && (
                  <IconComponent 
                    size={32} 
                    className="text-amber-800 group-hover:text-pink-800 transition-colors"
                    strokeWidth={1.5}
                  />
                )}
              </div>
              <span className="mt-4 text-sm md:text-base font-bold text-slate-700 group-hover:text-emerald-700 transition-colors text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Occasions;