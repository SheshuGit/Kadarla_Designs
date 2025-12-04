import React, { useState, useEffect } from 'react';
import { itemsAPI, Item } from '../utils/api';
import { Loader2 } from 'lucide-react';

const BestSellers: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const items = await itemsAPI.getItems('Best Sellers', true);
        console.log('BestSellers (Home): Fetched items', {
          count: items.length,
          items: items.map(i => ({
            id: i.id,
            title: i.title,
            hasImage: !!i.image,
            imageLength: i.image?.length || 0,
            imageType: i.imageType
          }))
        });
        // Limit to 4 items for home page
        const formattedProducts = items.slice(0, 4).map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          imageType: item.imageType || 'image/jpeg',
          discount: item.discount,
          discountTitle: item.discountTitle,
          discountStartDate: item.discountStartDate,
          discountEndDate: item.discountEndDate
        }));
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Error fetching best sellers:', err);
        // Fallback to empty array on error
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Helper function to convert base64 to data URL
  const getImageSrc = (image: string, imageType?: string) => {
    if (!image) return '';
    if (image.startsWith('http') || image.startsWith('/')) return image;
    if (imageType) return `data:${imageType};base64,${image}`;
    if (image.length > 100 && !image.includes('data:')) {
      return `data:image/jpeg;base64,${image}`;
    }
    return image;
  };

  // Helper function to check if discount is currently active
  const isDiscountActive = (item: any): boolean => {
    if (!item.discount || item.discount <= 0) return false;
    if (!item.discountStartDate || !item.discountEndDate) return true; // If no dates, always active
    
    const now = new Date();
    const startDate = new Date(item.discountStartDate);
    const endDate = new Date(item.discountEndDate);
    
    return now >= startDate && now <= endDate;
  };
  return (
    <section className="py-16 bg-white/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900">Best Seller</h2>
          <p className="text-slate-500 mt-3 font-medium italic">
            Discover timeless treasures that capture hearts and delight senses.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-emerald-600">
            <p>No best sellers available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-mint-100 flex flex-col group overflow-hidden cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={getImageSrc(product.image, product.imageType)}
                    alt={product.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.png';
                    }}
                  />
                <button className="absolute bottom-3 right-3 bg-white text-emerald-900 p-2 rounded-full shadow-md hover:bg-emerald-50 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                </button>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-serif text-lg font-semibold text-slate-800 leading-tight mb-2 line-clamp-2">
                  {product.title}
                </h3>
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    {product.discount && product.discount > 0 && isDiscountActive(product) ? (
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 line-through">₹{product.price.toLocaleString()}</p>
                        <p className="text-emerald-700 font-bold text-lg">
                          ₹{((product.price * (100 - product.discount)) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-red-600 font-semibold">{product.discount}% OFF</span>
                          {product.discountTitle && (
                            <span className="text-xs text-purple-600 font-medium">• {product.discountTitle}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-emerald-700 font-bold text-lg">
                        ₹{product.price.toLocaleString()}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      Best Seller
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;