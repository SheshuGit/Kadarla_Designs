import React from "react";

const ProductCard = ({ product, onClick }: any) => {
  return (
    <div
      className="bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-lg transition"
      onClick={() => onClick(product)}
    >
      <img
        src={product.image}
        alt={product.title}
        className="rounded-lg w-full h-48 object-cover"
      />

      <h3 className="mt-3 text-lg font-semibold text-emerald-900">
        {product.title}
      </h3>

      <p className="text-xl font-bold text-emerald-700">₹{product.price}</p>
    </div>
  );
};

export default ProductCard;
