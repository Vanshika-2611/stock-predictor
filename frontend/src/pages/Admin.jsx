import React, { useState, useEffect } from "react";
import axios from "axios";

const Admin = () => {
  const [file, setFile] = useState(null);
  const [symbol, setSymbol] = useState("");
  const [trainStatus, setTrainStatus] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file to upload.");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post("http://localhost:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ CSV uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("❌ Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    if (!symbol.trim()) return alert("Please enter a stock symbol.");
    try {
      setTrainStatus("⏳ Training started...");
      const res = await axios.post("http://localhost:8000/train", {
        symbol: symbol.toUpperCase(),
      });
      setTrainStatus(`✅ ${res.data.message || "Training completed."}`);
    } catch (err) {
      console.error("Training failed:", err);
      setTrainStatus("❌ Training failed.");
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/logs");
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Fetching logs failed:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold text-blue-600 text-center">🛠️ Admin Dashboard</h1>

      {/* Upload CSV */}
      <div className="bg-white p-6 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-4">📂 Upload Stock CSV</h2>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`${
            loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-2 rounded-xl transition`}
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </div>

      {/* Train Model */}
      <div className="bg-white p-6 shadow rounded-xl space-y-4">
        <h2 className="text-xl font-semibold">🧠 Train LSTM Model</h2>
        <input
          type="text"
          placeholder="Enter stock symbol (e.g. AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="border px-4 py-2 rounded-xl w-full"
        />
        <button
          onClick={handleTrain}
          className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700"
        >
          Train Model
        </button>
        {trainStatus && (
          <p className="text-sm text-gray-700">{trainStatus}</p>
        )}
      </div>

      {/* Logs */}
      <div className="bg-white p-6 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-4">📄 Prediction Logs</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 italic">No logs found.</p>
        ) : (
          <ul className="text-sm space-y-2 max-h-64 overflow-y-auto pr-2">
            {logs.map((log, i) => (
              <li key={i} className="border-b pb-2 text-gray-700">
                {log.trim()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Admin;
