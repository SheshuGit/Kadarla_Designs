import React, { useState } from "react";
import ProductCard from "../ProductCard";
import ProductModal from "../ProductModal";

const Birthday: React.FC = () => {
    const [selected, setSelected] = useState(null);

    const products = [
        {
            id: 1,
            title: "Sip & Share Surprise",
            price: 1649,
            image: "/images/bday1.png",
        },
        {
            id: 2,
            title: "Sweet Alternatives",
            price: 3079,
            image: "/images/bday2.png",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-center text-3xl font-bold text-emerald-800 mb-10">
                Birthday
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

export default Birthday;
