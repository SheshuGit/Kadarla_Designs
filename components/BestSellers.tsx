import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI, Item } from '../utils/api';
import { Loader2, Heart } from 'lucide-react';
import { getUser, favoritesAPI } from '../utils/api';
import { PLACEHOLDER_IMAGE } from '../utils/constants';

const BestSellers: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        // Fetch top 4 ordered items (best sellers based on order count)
        const items = await itemsAPI.getTopOrderedItems(4);
        
        if (!items || items.length === 0) {
          // If no ordered items, try to get some active items as fallback
          try {
            const allItems = await itemsAPI.getItems(undefined, true);
            const fallbackItems = allItems.slice(0, 4).map(item => ({
              id: item.id,
              title: item.title,
              price: typeof item.price === 'number' ? item.price : parseFloat(item.price.toString()),
              image: item.image,
              imageType: item.imageType || 'image/jpeg',
              discount: item.discount || 0,
              discountTitle: item.discountTitle || '',
              discountStartDate: item.discountStartDate,
              discountEndDate: item.discountEndDate
            }));
            setProducts(fallbackItems);
          } catch (fallbackErr) {
            console.error('Error fetching fallback items:', fallbackErr);
            setProducts([]);
          }
          return;
        }
        
        const formattedProducts = items.map(item => ({
          id: item.id || item._id?.toString(),
          title: item.title,
          price: typeof item.price === 'number' ? item.price : parseFloat(item.price.toString()),
          image: item.image,
          imageType: item.imageType || 'image/jpeg',
          discount: item.discount || 0,
          discountTitle: item.discountTitle || '',
          discountStartDate: item.discountStartDate,
          discountEndDate: item.discountEndDate
        }));
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Error fetching best sellers:', err);
        // Try fallback to get some items
        try {
          const allItems = await itemsAPI.getItems(undefined, true);
          const fallbackItems = allItems.slice(0, 4).map(item => ({
            id: item.id,
            title: item.title,
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price.toString()),
            image: item.image,
            imageType: item.imageType || 'image/jpeg',
            discount: item.discount || 0,
            discountTitle: item.discountTitle || '',
            discountStartDate: item.discountStartDate,
            discountEndDate: item.discountEndDate
          }));
          setProducts(fallbackItems);
        } catch (fallbackErr) {
          console.error('Error fetching fallback items:', fallbackErr);
          setProducts([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (user && products.length > 0) {
      checkAllFavorites();
    }
  }, [user, products.length]);

  const checkAllFavorites = async () => {
    if (!user) return;
    const favorites: Record<string, boolean> = {};
    for (const product of products) {
      try {
        const isFav = await favoritesAPI.checkFavorite(product.id, user.id);
        favorites[product.id] = isFav;
      } catch (error) {
        console.error(`Error checking favorite for ${product.id}:`, error);
      }
    }
    setFavoritesMap(favorites);
  };

  const handleFavoriteClick = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    
    if (!user) {
      alert('Please login to add items to favorites');
      return;
    }

    try {
      const isFavorited = favoritesMap[productId];
      if (isFavorited) {
        await favoritesAPI.removeFavorite(productId, user.id);
        setFavoritesMap(prev => ({ ...prev, [productId]: false }));
      } else {
        await favoritesAPI.addFavorite(productId, user.id);
        setFavoritesMap(prev => ({ ...prev, [productId]: true }));
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      alert(error.message || 'Failed to update favorite. Please try again.');
    }
  };

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
                onClick={() => navigate(`/product/${product.id}`)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-mint-100 flex flex-col group overflow-hidden cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <img
                    src={getImageSrc(product.image, product.imageType)}
                  alt={product.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  {/* Favorite Heart Icon */}
                  <button
                    onClick={(e) => handleFavoriteClick(e, product.id)}
                    disabled={!user}
                    className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-lg transition-all transform hover:scale-110 ${
                      favoritesMap[product.id]
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-400 hover:bg-white hover:text-red-500'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={user ? (favoritesMap[product.id] ? 'Remove from favorites' : 'Add to favorites') : 'Login to add favorites'}
                  >
                    <Heart 
                      size={20} 
                      className={favoritesMap[product.id] ? 'fill-current' : ''}
                    />
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
