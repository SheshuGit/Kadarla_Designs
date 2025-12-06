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

// CATEGORY PAGE
import CategoryPage from "./components/CategoryPage";
import SearchResults from "./components/SearchResults";
import Registration from "./components/Registration";
import ProductDetail from "./components/ProductDetail";
import Favorites from "./components/Favorites";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import MyOrders from "./components/MyOrders";
import UserOrderDetails from "./components/UserOrderDetails";
import UserChat from "./components/UserChat";

// ADMIN PAGES
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import OrdersReceived from "./components/admin/OrdersReceived";
import CompletedOrders from "./components/admin/CompletedOrders";
import AddItem from "./components/admin/AddItem";
import Payments from "./components/admin/Payments";
import Analytics from "./components/admin/Analytics";
import Chat from "./components/admin/Chat";
import Items from "./components/admin/Items";
import OrderDetails from "./components/admin/OrderDetails";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* MAIN APP ROUTES */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <main className="space-y-6">
                <Hero />
                <CuratedGifts />
                <BestSellersHome />
                <Occasions />
                <Testimonials />
              </main>
              <Footer />
            </div>
          }
        />

        {/* CATEGORY PAGE - Unified filter-based category page */}
        <Route
          path="/category/:category"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <CategoryPage />
              <Footer />
            </div>
          }
        />

        {/* SEARCH RESULTS PAGE */}
        <Route
          path="/search"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <SearchResults />
              <Footer />
            </div>
          }
        />
        
        {/* PRODUCT DETAIL PAGE */}
        <Route
          path="/product/:id"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <ProductDetail />
              <Footer />
            </div>
          }
        />

        {/* FAVORITES PAGE */}
        <Route
          path="/favorites"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <Favorites />
              <Footer />
            </div>
          }
        />

        {/* CART PAGE */}
        <Route
          path="/cart"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <Cart />
              <Footer />
            </div>
          }
        />

        {/* CHECKOUT PAGE */}
        <Route
          path="/checkout"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <Checkout />
              <Footer />
            </div>
          }
        />

        {/* MY ORDERS PAGE */}
        <Route
          path="/orders"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <MyOrders />
              <Footer />
            </div>
          }
        />

        {/* USER ORDER DETAILS PAGE */}
        <Route
          path="/orders/:orderId"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <UserOrderDetails />
              <Footer />
            </div>
          }
        />

        {/* AUTH PAGES */}
        <Route
          path="/register"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <Registration />
              <Footer />
            </div>
          }
        />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders/received" element={<OrdersReceived />} />
          <Route path="orders/completed" element={<CompletedOrders />} />
          <Route path="orders/:orderId" element={<OrderDetails />} />
          <Route path="items" element={<Items />} />
          <Route path="add-item" element={<AddItem />} />
          <Route path="payments" element={<Payments />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="chat" element={<Chat />} />
        </Route>
      </Routes>
      {/* Global Chat Component - appears on all pages */}
      <UserChat />
    </BrowserRouter>
  );
};

export default App;
