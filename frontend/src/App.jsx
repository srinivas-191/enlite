import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./app.css";
import ScrollToTop from "./components/ScrollToTop";

let HomePage = React.lazy(() => import("./pages/HomePage"));
let AboutPage = React.lazy(() => import("./pages/AboutPage"));
let ContactPage = React.lazy(() => import("./pages/ContactUs"));
let PredictPage = React.lazy(() => import("./pages/PredictPage"));
let Solutions = React.lazy(() => import("./pages/Solutions"));

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white text-gray-900">
      {/* Navbar */}
      <Navbar />
      <ScrollToTop/>
      {/* Routes */}
      <Suspense fallback={<h1 className="text-center text-emerald-600 py-10">Loading...</h1>}>
        <Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/home" element={<HomePage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/predict" element={<PredictPage />} />
  <Route path="/solutions" element={<Solutions />} />
  <Route path="/contact" element={<ContactPage />} />
</Routes>

      </Suspense>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
