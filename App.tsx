import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import CategoryBar from "./components/CategoryBar";

import Hero from "./components/Hero";
import CuratedGifts from "./components/CuratedGifts";
import BestSellersHome from "./components/BestSellers"; // HOME BestSellers section
import Occasions from "./components/Occasions";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";

// CATEGORY PAGES
import Birthday from "./components/category/Birthday";
import Anniversary from "./components/category/Anniversary";
import Corporate from "./components/category/Corporate";
import Wedding from "./components/category/Wedding";
import BestSellersPage from "./components/category/Best_Sellers"; // category page

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
        <Navbar />
        <CategoryBar />

        {/* ROUTES */}
        <Routes>
          {/* HOME PAGE */}
          <Route
            path="/"
            element={
              <main className="space-y-6">
                <Hero />
                <CuratedGifts />
                <BestSellersHome />
                <Occasions />
                <Testimonials />
              </main>
            }
          />

          {/* CATEGORY PAGES */}
          <Route path="/birthday" element={<Birthday />} />
          <Route path="/anniversary" element={<Anniversary />} />
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/wedding" element={<Wedding />} />
          <Route path="/best-sellers" element={<BestSellersPage />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
