//CategoryBar.tsx

import React from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  { label: "BIRTHDAY", path: "/birthday" },
  { label: "ANNIVERSARY", path: "/anniversary" },
  { label: "BEST SELLERS", path: "/best-sellers" },
  { label: "CORPORATE", path: "/corporate" },
  { label: "WEDDING", path: "/wedding" },
];

const CategoryBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white/50 border-b border-mint-100 py-3 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-6 flex justify-center space-x-4 min-w-max">
        {categories.map((cat, index) => (
          <button
            key={index}
            onClick={() => navigate(cat.path)}
            className="px-6 py-2 bg-mint-50 hover:bg-emerald-100 border border-emerald-50 rounded-full text-emerald-800 text-sm font-bold tracking-wider transition-all shadow-sm hover:shadow-md whitespace-nowrap"
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
