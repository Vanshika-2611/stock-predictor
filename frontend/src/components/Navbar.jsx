import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Watchlist", path: "/watchlist" },
    { name: "Stock Details", path: "/stock" },
    { name: "Predict", path: "/predict" },
    { name: "Admin", path: "/admin" },
  ];

  const linkClass = (path) =>
    `transition-colors duration-200 ${
      location.pathname === path
        ? "text-blue-600 font-semibold underline underline-offset-4"
        : "text-gray-600 hover:text-blue-600"
    }`;

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold text-blue-700">
        📊 Stock Predictor
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex gap-6">
        {links.map((link) => (
          <Link key={link.name} to={link.path} className={linkClass(link.path)}>
            {link.name}
          </Link>
        ))}
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-start p-4 gap-4 md:hidden z-50">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={linkClass(link.path)}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
