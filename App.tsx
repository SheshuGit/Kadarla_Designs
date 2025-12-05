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
import Registration from "./components/Registration";
import ProductDetail from "./components/ProductDetail";
import Favorites from "./components/Favorites";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import MyOrders from "./components/MyOrders";
import UserOrderDetails from "./components/UserOrderDetails";

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

        {/* CATEGORY PAGES */}
        <Route
          path="/birthday"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <Birthday />
              <Footer />
            </div>
          }
        />
        <Route
          path="/anniversary"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <Anniversary />
              <Footer />
            </div>
          }
        />
        <Route
          path="/corporate"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <Corporate />
              <Footer />
            </div>
          }
        />
        <Route
          path="/wedding"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <Wedding />
              <Footer />
            </div>
          }
        />
        <Route
          path="/best-sellers"
          element={
            <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
              <Navbar />
              <CategoryBar />
              <BestSellersPage />
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
    </BrowserRouter>
  );
};

export default App;
