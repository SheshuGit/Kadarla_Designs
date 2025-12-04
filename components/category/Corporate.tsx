import React, { useState } from "react";
import ProductCard from "../ProductCard";
import ProductModal from "../ProductModal";

const Corporate: React.FC = () => {
    const [selected, setSelected] = useState(null);

    const products = [
        {
            id: 1,
            title: "Premium Office Hamper",
            price: 3499,
            image: "/images/corporate1.png",
        },
        {
            id: 2,
            title: "Team Appreciation Box",
            price: 2899,
            image: "/images/corporate2.png",
        },
        {
            id: 3,
            title: "Luxury Employee Kit",
            price: 4599,
            image: "/images/corporate3.png",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-center text-3xl font-bold text-emerald-800 mb-10">
                Corporate Gifts
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

export default Corporate;
