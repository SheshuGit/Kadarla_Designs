import React, { useState } from "react";
import ProductCard from "../ProductCard";
import ProductModal from "../ProductModal";

// Importing images from the correct relative path based on BestSellers.tsx
import best1 from '../../images/best1.png';
import bs2 from '../../images/bs2.jpg';
import bs3 from '../../images/bs3.png';
import bs4 from '../../images/bs4.png';

const BestSellersPage: React.FC = () => {
    const [selected, setSelected] = useState(null);

    const products = [
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

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-center text-3xl font-bold text-emerald-800 mb-10">
                Best Sellers
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} onClick={setSelected} />
                ))}
            </div>

            <ProductModal product={selected} onClose={() => setSelected(null)} />
        </div>
    );
};

export default BestSellersPage;
