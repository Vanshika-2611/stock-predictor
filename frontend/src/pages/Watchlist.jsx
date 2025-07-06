import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_KEY = "FATU937FEN2WZ9RN";

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    const stored = localStorage.getItem("watchlist");
    return stored ? JSON.parse(stored) : [];
  });

  const [stocksData, setStocksData] = useState({});
  const [errors, setErrors] = useState({});
  const [newSymbol, setNewSymbol] = useState("");

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Fetch stock data
  useEffect(() => {
    const fetchStock = async (symbol) => {
      try {
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
        const res = await axios.get(url);
        const series = res.data["Time Series (Daily)"];
        if (!series) throw new Error("Invalid symbol or API limit");

        const dates = Object.keys(series);
        const latest = parseFloat(series[dates[0]]["4. close"]);
        const prev = parseFloat(series[dates[1]]["4. close"]);
        const predicted = (latest * 1.02).toFixed(2); // fake prediction

        setStocksData((prev) => ({
          ...prev,
          [symbol]: {
            current: latest.toFixed(2),
            predicted,
          },
        }));
      } catch (err) {
        setErrors((prev) => ({ ...prev, [symbol]: "Failed to load data" }));
      }
    };

    watchlist.forEach((symbol) => {
      if (!stocksData[symbol]) fetchStock(symbol);
    });
  }, [watchlist]);

  // Add new symbol
  const addToWatchlist = () => {
    const sym = newSymbol.trim().toUpperCase();
    if (!sym || watchlist.includes(sym)) return;
    setWatchlist([...watchlist, sym]);
    setNewSymbol("");
  };

  // Remove symbol
  const removeStock = (symbol) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
    setStocksData((prev) => {
      const { [symbol]: _, ...rest } = prev;
      return rest;
    });
    setErrors((prev) => {
      const { [symbol]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">⭐ Watchlist</h1>

      {/* Add New */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          placeholder="Enter stock symbol (e.g. AAPL)"
          className="px-4 py-2 border rounded-xl w-60"
        />
        <button
          onClick={addToWatchlist}
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
        >
          Add
        </button>
      </div>

      {/* Table */}
      {watchlist.length === 0 ? (
        <p className="text-gray-500 mt-4">No stocks in watchlist yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-xl">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="p-3 text-left">Symbol</th>
                <th className="p-3 text-left">Current</th>
                <th className="p-3 text-left">Predicted</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {watchlist.map((symbol) => (
                <tr key={symbol} className="border-t">
                  <td className="p-3 font-medium text-blue-700">
                    <Link to={`/stock?symbol=${symbol}`}>{symbol}</Link>
                  </td>
                  <td className="p-3">
                    {stocksData[symbol]?.current
                      ? `$${stocksData[symbol].current}`
                      : errors[symbol]
                      ? <span className="text-red-500">{errors[symbol]}</span>
                      : "Loading..."}
                  </td>
                  <td className="p-3">
                    {stocksData[symbol]?.predicted
                      ? `$${stocksData[symbol].predicted}`
                      : errors[symbol]
                      ? "—"
                      : "Calculating..."}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => removeStock(symbol)}
                      className="text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
