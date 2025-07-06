import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_KEY = "FATU937FEN2WZ9RN"; // Alpha Vantage
const NEWS_API_KEY = "pub_5b6d67b2babd4fce94b449921a4447c9"; // NewsData.io
const symbols = ["AAPL", "TSLA", "MSFT"];

const Home = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [news, setNews] = useState([]);
  const navigate = useNavigate();

  const fetchStockData = async () => {
    try {
      const stockData = await Promise.all(
        symbols.map(async (symbol) => {
          const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
          const res = await axios.get(url);
          const timeSeries = res.data["Time Series (Daily)"];
          if (!timeSeries) return null;

          const dates = Object.keys(timeSeries);
          const latest = timeSeries[0] ? timeSeries[dates[0]] : null;
          const prev = timeSeries[1] ? timeSeries[dates[1]] : null;

          if (!latest || !prev) return null;

          const price = parseFloat(latest["4. close"]);
          const prevPrice = parseFloat(prev["4. close"]);
          const change = price - prevPrice;
          const changePercent = ((change / prevPrice) * 100).toFixed(2);

          return {
            symbol,
            price: price.toFixed(2),
            change: `${change >= 0 ? "+" : ""}${changePercent}%`,
            positive: change >= 0,
          };
        })
      );

      setStocks(stockData.filter(Boolean));
    } catch (err) {
      console.error("Error fetching stock data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await axios.get(
        `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&category=business&language=en&country=us`
      );
      setNews(res.data.results.slice(0, 5));
    } catch (err) {
      console.error("Error fetching news:", err);
    }
  };

  useEffect(() => {
    fetchStockData();
    fetchNews();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/stock?symbol=${searchTerm.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-12 py-10">
      {/* Search */}
      <div className="relative max-w-xl mx-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search stock symbol (e.g. AAPL)"
          className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring focus:ring-blue-200"
        />
        <button
          onClick={handleSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600"
        >
          <Search />
        </button>
      </div>

      {/* Stock Cards */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">📈 Market Highlights</h2>
        {loading ? (
          <p className="text-gray-500 text-center">Loading stock data...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {stocks.map((stock) => (
              <Link
                to={`/stock?symbol=${stock.symbol}`}
                key={stock.symbol}
                className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-600">{stock.symbol}</h3>
                    <p className="text-gray-400 text-sm">Real-time Data</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${stock.price}</p>
                    <p
                      className={`font-medium ${
                        stock.positive ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {stock.change}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* News Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">📰 Latest Financial News</h2>
        {news.length === 0 ? (
          <p className="text-gray-500">Loading news...</p>
        ) : (
          <ul className="space-y-4">
            {news.map((item, i) => (
              <li
                key={i}
                className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl shadow-sm transition"
              >
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium hover:underline"
                >
                  {item.title}
                </a>
                <p className="text-sm text-gray-500 mt-1">
                  {item.source_id} • {new Date(item.pubDate).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
