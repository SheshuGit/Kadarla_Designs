import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { itemsAPI, Item, getUser, favoritesAPI } from "../utils/api";
import { Loader2, Search } from "lucide-react";

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Get all active items
        const allItems = await itemsAPI.getItems(undefined, true);
        
        // Filter items based on search query
        const filteredItems = allItems.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
        );

        const formattedProducts = filteredItems.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          imageType: item.imageType || 'image/jpeg',
          description: item.description,
          stock: item.stock,
          discount: item.discount,
          discountTitle: item.discountTitle,
          discountStartDate: item.discountStartDate,
          discountEndDate: item.discountEndDate,
          category: item.category
        }));

        setProducts(formattedProducts);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchFavorites = async () => {
      if (!user) {
        setFavoritesMap({});
        return;
      }

      try {
        const favorites = await favoritesAPI.getUserFavorites(user.id);
        const favoritesMapData: Record<string, boolean> = {};
        favorites.forEach(fav => {
          favoritesMapData[fav.itemId] = true;
        });
        setFavoritesMap(favoritesMapData);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setFavoritesMap({});
      }
    };

    fetchSearchResults();
    fetchFavorites();
  }, [query, user]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-emerald-900 mb-2">
          Search Results
        </h1>
        {query && (
          <p className="text-emerald-600">
            {products.length > 0 
              ? `Found ${products.length} result${products.length === 1 ? '' : 's'} for "${query}"`
              : `No results found for "${query}"`
            }
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-emerald-600" size={48} />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-600">
          <p>{error}</p>
        </div>
      ) : !query.trim() ? (
        <div className="text-center py-20">
          <Search className="mx-auto text-emerald-400 mb-4" size={48} />
          <p className="text-emerald-600 text-lg">Please enter a search query</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Search className="mx-auto text-emerald-400 mb-4" size={48} />
          <p className="text-emerald-600 text-lg mb-2">No products found matching "{query}"</p>
          <p className="text-emerald-500 text-sm">Try searching with different keywords</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <ProductCard 
              key={p.id} 
              product={p} 
              isFavorited={favoritesMap[p.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;

