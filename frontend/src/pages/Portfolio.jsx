import React, { useState } from "react";
import Chart from "react-apexcharts";

const Portfolio = () => {
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [investments, setInvestments] = useState([]);

  const handleAdd = () => {
    if (!symbol || !qty || !price || !date) return alert("Please fill all fields");
    const newInvestment = {
      symbol: symbol.toUpperCase(),
      qty: parseFloat(qty),
      price: parseFloat(price),
      date,
    };
    setInvestments([...investments, newInvestment]);
    setSymbol("");
    setQty("");
    setPrice("");
    setDate("");
  };

  const handleDelete = (index) => {
    const updated = [...investments];
    updated.splice(index, 1);
    setInvestments(updated);
  };

  const totalInvestment = investments.reduce(
    (sum, inv) => sum + inv.qty * inv.price,
    0
  );

  const chartData = {
    series: investments.map((inv) => (inv.qty * inv.price).toFixed(2)),
    options: {
      labels: investments.map((inv) => `${inv.symbol} ($${(inv.qty * inv.price).toFixed(0)})`),
      legend: { position: "bottom" },
      colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#ec4899", "#14b8a6"],
    },
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-10">
      <h1 className="text-3xl font-bold text-blue-600 text-center">📈 Your Portfolio</h1>

      {/* Investment Form */}
      <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">➕ Add Investment</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Symbol (AAPL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          />
          <input
            type="number"
            placeholder="Buy Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          />
        </div>
        <button
          onClick={handleAdd}
          className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
        >
          Add to Portfolio
        </button>
      </div>

      {/* Summary Table */}
      {investments.length > 0 && (
        <div className="bg-white shadow-md rounded-xl p-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">🧾 Investment Summary</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Symbol</th>
                <th>Qty</th>
                <th>Buy Price</th>
                <th>Invested</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{inv.symbol}</td>
                  <td>{inv.qty}</td>
                  <td>${inv.price.toFixed(2)}</td>
                  <td>${(inv.qty * inv.price).toFixed(2)}</td>
                  <td>{inv.date}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right mt-4 font-semibold text-lg text-blue-700">
            Total Invested: ${totalInvestment.toFixed(2)}
          </div>
        </div>
      )}

      {/* Pie Chart */}
      {investments.length > 0 && (
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">📊 Holdings Breakdown</h2>
          <Chart
            type="pie"
            height={300}
            series={chartData.series}
            options={chartData.options}
          />
        </div>
      )}
    </div>
  );
};

export default Portfolio;
