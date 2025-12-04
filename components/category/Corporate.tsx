import React, { useState, useEffect } from "react";
import ProductCard from "../ProductCard";
import { itemsAPI, Item, getUser, favoritesAPI } from "../../utils/api";
import { Loader2 } from "lucide-react";

const Corporate: React.FC = () => {
    const [products, setProducts] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const items = await itemsAPI.getItems('Corporate', true);
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
                    discountEndDate: item.discountEndDate
                }));
                setProducts(formattedProducts);
            } catch (err) {
                console.error('Error fetching corporate items:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-center text-3xl font-bold text-emerald-800 mb-10">
                Corporate Gifts
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

export default Corporate;
