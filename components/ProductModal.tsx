import React from "react";

const ProductModal = ({ product, onClose }: any) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md">
        <img src={product.image} className="rounded-xl w-full h-60 object-cover" />

        <h2 className="text-2xl font-bold mt-4 text-emerald-900">
          {product.title}
        </h2>

        <p className="text-xl text-emerald-700 font-semibold mt-2">
          ₹{product.price}
        </p>

        <label className="block mt-4 font-semibold">Quantity</label>
        <input
          type="number"
          min="1"
          defaultValue="1"
          className="w-full border p-2 rounded-lg mt-1"
        />

        <label className="block mt-4 font-semibold">Custom Message</label>
        <textarea
          className="w-full border p-2 rounded-lg mt-1"
          placeholder="Enter customization message..."
        />

        <button className="w-full mt-5 bg-emerald-700 text-white p-3 rounded-lg font-bold hover:bg-emerald-800">
          Add to Cart
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 text-red-600 font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProductModal;
