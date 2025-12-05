import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import { itemsAPI, Item, getUser, favoritesAPI } from "../utils/api";
import { Loader2 } from "lucide-react";

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<any>(null);

  // Map URL category to actual category name
  const categoryMap: Record<string, string> = {
    'birthday': 'Birthday',
    'anniversary': 'Anniversary',
    'housewarming': 'Housewarming',
    'wedding': 'Wedding',
    'baby-shower': 'Baby Shower',
    'congratulations': 'Congratulations',
    'farewell': 'Farewell',
    'get-well-soon': 'Get Well Soon',
    'proposal': 'Proposal',
    'corporate': 'Corporate',
  };

  const categoryName = category ? categoryMap[category.toLowerCase()] || category : '';

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      if (!categoryName) return;

      try {
        setIsLoading(true);
        setError(null);
        const items = await itemsAPI.getItems(categoryName, true);
        
        const formattedProducts = items.map(item => ({
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
        console.error(`Error fetching ${categoryName} items:`, err);
        setError('Failed to load products. Please try again later.');
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

    fetchItems();
    fetchFavorites();
  }, [categoryName, user]);

  if (!categoryName) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center py-20 text-red-600">
          <p>Invalid category</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-center text-3xl font-bold text-emerald-800 mb-10">
        {categoryName}
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-emerald-600" size={48} />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-600">
          <p>{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-emerald-600">
          <p>No products available in this category.</p>
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

export default CategoryPage;

