import React, { useState } from "react";
import axios from "axios";
import Chart from "react-apexcharts";

const Predict = () => {
  const [symbol, setSymbol] = useState("");
  const [days, setDays] = useState(10);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");

  const handleTrain = async () => {
    if (!symbol.trim()) {
      return setError("Please enter a stock symbol to train.");
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/train", {
        symbol: symbol.toUpperCase(),
      });
      alert(res.data.message || "Training complete.");
    } catch (err) {
      console.error(err);
      setError("Training failed. Please try again.");
    }
    setLoading(false);
  };

  const handlePredict = async () => {
    if (!symbol.trim()) {
      return setError("Please enter a stock symbol to predict.");
    }
    setError("");
    setLoading(true);
    setChartData(null);
    try {
      const res = await axios.post("http://localhost:8000/predict", {
        symbol: symbol.toUpperCase(),
        days: parseInt(days),
      });

      const { predicted, actual, dates } = res.data;

      if (!predicted || !actual || !dates) {
        throw new Error("Invalid data received");
      }

      setChartData({
        series: [
          { name: "Actual Price", data: actual },
          { name: "Predicted Price", data: predicted },
        ],
        categories: dates,
      });
    } catch (err) {
      console.error("Prediction error:", err);
      setError("Prediction failed. Please try a different stock symbol.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10">
      <h1 className="text-3xl font-bold text-blue-600 text-center">
        🔮 Stock Price Prediction
      </h1>

      {/* Input Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Stock Symbol (e.g., AAPL)"
          className="border px-4 py-2 rounded-xl focus:ring focus:ring-blue-200"
        />
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          min={1}
          max={30}
          placeholder="Days to Predict"
          className="border px-4 py-2 rounded-xl focus:ring focus:ring-blue-200"
        />
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={handleTrain}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl shadow disabled:opacity-50"
        >
          {loading ? "Training..." : "Train"}
        </button>
        <button
          onClick={handlePredict}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow disabled:opacity-50"
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </div>

      {/* Chart */}
      {chartData && (
        <div className="bg-white p-6 rounded-xl shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
            📉 Actual vs Predicted
          </h2>
          <Chart
            type="line"
            height={400}
            series={chartData.series}
            options={{
              chart: {
                id: "prediction-chart",
                toolbar: { show: false },
                zoom: { enabled: false },
              },
              xaxis: {
                categories: chartData.categories,
                labels: { rotate: -45 },
                title: { text: "Date" },
              },
              yaxis: {
                title: { text: "Price (USD)" },
              },
              tooltip: { shared: true },
              stroke: { curve: "smooth" },
              markers: { size: 4 },
              legend: { position: "top" },
              colors: ["#3b82f6", "#10b981"],
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Predict;
