import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Chart from "react-apexcharts";

const API_KEY = "FATU937FEN2WZ9RN";

const StockDetails = () => {
  const [params] = useSearchParams();
  const symbol = params.get("symbol")?.toUpperCase() || "AAPL";

  const [priceData, setPriceData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStockDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
      const res = await axios.get(url);

      if (res.data["Note"] || res.data["Error Message"] || !res.data["Time Series (Daily)"]) {
        throw new Error("Invalid symbol or API limit exceeded");
      }

      const series = res.data["Time Series (Daily)"];
      const dates = Object.keys(series).slice(0, 60).reverse();

      const chart = dates.map((date) => ({
        x: new Date(date),
        y: [
          parseFloat(series[date]["1. open"]),
          parseFloat(series[date]["2. high"]),
          parseFloat(series[date]["3. low"]),
          parseFloat(series[date]["4. close"]),
        ],
        volume: parseInt(series[date]["5. volume"]),
      }));

      const latest = series[dates[dates.length - 1]];
      const previous = series[dates[dates.length - 2]];

      const latestClose = parseFloat(latest["4. close"]);
      const prevClose = parseFloat(previous["4. close"]);
      const change = latestClose - prevClose;
      const changePercent = ((change / prevClose) * 100).toFixed(2);

      setPriceData({
        current: latestClose.toFixed(2),
        change: change.toFixed(2),
        percent: changePercent,
        open: latest["1. open"],
        high: latest["2. high"],
        low: latest["3. low"],
        volume: latest["5. volume"],
      });

      setChartData(chart);
    } catch (err) {
      console.error(err);
      setError("Could not fetch stock data. Please check the symbol or try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockDetails();
  }, [symbol]);

  return (
    <div className="space-y-8 mt-4 max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-blue-600">{symbol} Stock Details</h1>

      {loading ? (
        <p className="text-gray-500">Loading data...</p>
      ) : error ? (
        <div className="text-red-500 bg-red-100 p-4 rounded-xl">{error}</div>
      ) : (
        <>
          {/* Price Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white shadow rounded-xl">
              <p className="text-sm text-gray-500">Current Price</p>
              <p className="text-xl font-bold">${priceData.current}</p>
              <p className={`font-medium ${priceData.change < 0 ? "text-red-500" : "text-green-600"}`}>
                {priceData.change} ({priceData.percent}%)
              </p>
            </div>
            <div className="p-4 bg-white shadow rounded-xl">
              <p className="text-sm text-gray-500">Open</p>
              <p className="text-xl font-semibold">${parseFloat(priceData.open).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white shadow rounded-xl">
              <p className="text-sm text-gray-500">High</p>
              <p className="text-xl font-semibold">${parseFloat(priceData.high).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white shadow rounded-xl">
              <p className="text-sm text-gray-500">Low</p>
              <p className="text-xl font-semibold">${parseFloat(priceData.low).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white shadow rounded-xl">
              <p className="text-sm text-gray-500">Volume</p>
              <p className="text-xl font-semibold">{priceData.volume}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">📊 Price Trend (60 Days)</h2>
            <Chart
              type="candlestick"
              height={400}
              series={[{ data: chartData }]}
              options={{
                chart: { type: "candlestick", toolbar: { show: true } },
                xaxis: { type: "datetime" },
                yaxis: { tooltip: { enabled: true } },
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default StockDetails;
