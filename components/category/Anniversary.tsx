import React, { useState } from "react";
import ProductCard from "../ProductCard";
import ProductModal from "../ProductModal";

const Anniversary: React.FC = () => {
    const [selected, setSelected] = useState(null);

    const products = [
        {
            id: 1,
            title: "Romantic Love Hamper",
            price: 2299,
            image: "/images/anniversary1.png",
        },
        {
            id: 2,
            title: "Couple Celebration Box",
            price: 3199,
            image: "/images/anniversary2.png",
        },
        {
            id: 3,
            title: "Sweet Love Basket",
            price: 1899,
            image: "/images/anniversary3.png",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-center text-3xl font-bold text-emerald-800 mb-10">
                Anniversary
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

export default Anniversary;
