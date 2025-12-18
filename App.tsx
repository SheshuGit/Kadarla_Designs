import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getUser } from "./utils/api";

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
import RequireAuth from "./components/RequireAuth";
import LoginPage from "./components/LoginPage";

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
  // Get current user to check role - make it reactive
  const [isAdmin, setIsAdmin] = useState(() => {
    const user = getUser();
    return user?.role === 'admin';
  });

  // Update admin status when user changes (login/logout)
  useEffect(() => {
    const checkUserRole = () => {
      const user = getUser();
      setIsAdmin(user?.role === 'admin');
    };

    // Check immediately
    checkUserRole();

    // Listen for storage changes (login from another tab)
    window.addEventListener('storage', checkUserRole);

    // Also check periodically in case user logs in/out
    const interval = setInterval(checkUserRole, 1000);

    return () => {
      window.removeEventListener('storage', checkUserRole);
      clearInterval(interval);
    };
  }, []);

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
              <RequireAuth>
                <Favorites />
              </RequireAuth>
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
              <RequireAuth>
                <Cart />
              </RequireAuth>
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
              <RequireAuth>
                <Checkout />
              </RequireAuth>
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
              <RequireAuth>
                <MyOrders />
              </RequireAuth>
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
              <RequireAuth>
                <UserOrderDetails />
              </RequireAuth>
              <Footer />
            </div>
          }
        />

        {/* AUTH PAGES */}
        <Route
          path="/login"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <LoginPage />
              <Footer />
            </div>
          }
        />
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
      {/* Global Chat Component - only visible to users, not admins */}
      {!isAdmin && <UserChat />}
    </BrowserRouter>
  );
};

export default App;
