import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import StockDetails from "./pages/StockDetails";
import Predict from "./pages/Predict";
import Admin from "./pages/Admin";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/stock" element={<StockDetails />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
