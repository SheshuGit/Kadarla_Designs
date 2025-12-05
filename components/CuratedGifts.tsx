import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Collection } from '../types';
import birthdayImg from '../images/birthday.png';
import anniversaryImg from '../images/anniversary.png';
import homeImg from '../images/home.png';

const collections: Collection[] = [
  { id: 1, title: 'Birthday Selection', image: birthdayImg },
  { id: 2, title: 'Anniversary Range', image: anniversaryImg },
  { id: 3, title: 'Home Decor', image: homeImg },
];

// Displaying only first 3 for grid consistency with prompt sketch 
// or using a grid layout that adapts.
// Prompt says "3-column grid", listed 4 examples. I will show 3 dominant ones or a grid that handles multiples.
// Let's show the first 3 as primary highlights.

const CuratedGifts: React.FC = () => {
  const navigate = useNavigate();
  const displayCollections = collections.slice(0, 3);

  // Map collection titles to category URLs
  const getCategoryPath = (title: string): string => {
    const categoryMap: Record<string, string> = {
      'Birthday Selection': '/category/birthday',
      'Anniversary Range': '/category/anniversary',
      'Home Decor': '/category/housewarming',
    };
    return categoryMap[title] || '/';
  };

  const handleCollectionClick = (title: string) => {
    const path = getCategoryPath(title);
    navigate(path);
  };

  return (
    <section className="py-16 max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900 mb-2">Curated Gifts</h2>
        <div className="h-1 w-24 bg-pastel-pink mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {displayCollections.map((item) => (
          <div 
            key={item.id} 
            onClick={() => handleCollectionClick(item.title)}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-md bg-white">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-serif font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                {item.title}
              </h3>
              <span className="text-sm text-emerald-500 font-bold uppercase tracking-widest mt-1 block opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                Shop Now
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CuratedGifts;