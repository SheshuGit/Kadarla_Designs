import React, { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUser, favoritesAPI, itemsAPI, Favorite, Item } from '../utils/api';
import ProductCard from './ProductCard';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    
    if (currentUser) {
      fetchFavorites();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Fetch favorites with items included in a single request
      const userFavorites = await favoritesAPI.getUserFavorites(user.id, true);
      setFavorites(userFavorites);
      
      // Extract items from favorites (items are already included)
      const favoriteItemsList = userFavorites
        .map(fav => fav.item)
        .filter(item => item !== null && item !== undefined) as Item[];
      
      setFavoriteItems(favoriteItemsList);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavoriteItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-mint-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Heart className="mx-auto text-pink-300 mb-4" size={64} />
          <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-2">
            Please Login
          </h2>
          <p className="text-emerald-600 mb-6">
            You need to be logged in to view your favorites.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mint-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mint-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-emerald-900 mb-2 flex items-center gap-3">
            <Heart className="text-pink-500 fill-pink-500" size={32} />
            My Favorites
          </h1>
          <p className="text-emerald-600">
            {favorites.length > 0 
              ? `You have ${favorites.length} favorite ${favorites.length === 1 ? 'item' : 'items'}`
              : 'Your favorite items will appear here'}
          </p>
        </div>

        {/* Favorites Grid */}
        {favoriteItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-emerald-100">
            <Heart className="mx-auto text-pink-300 mb-4" size={64} />
            <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-2">
              No Favorites Yet
            </h2>
            <p className="text-emerald-600 mb-6">
              Start adding items to your favorites by clicking the heart icon on any product.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteItems.map((item) => (
              <ProductCard 
                key={item.id} 
                product={item}
                isFavorited={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;

