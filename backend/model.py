# backend/model.py
import numpy as np
import pandas as pd
import yfinance as yf
import os
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
import joblib
import datetime

# Default model/scaler file names (generic)
DEFAULT_MODEL_PATH = "models/default_model.h5"
DEFAULT_SCALER_PATH = "scalers/default_scaler.gz"

def fetch_data(symbol):
    try:
        df = yf.download(symbol, period="1y", progress=False)
        if df.empty or "Close" not in df.columns:
            raise Exception(f"No data found for {symbol}")
        return df["Close"].values.reshape(-1, 1), df
    except Exception as e:
        raise Exception(f"Failed to fetch data for {symbol}: {str(e)}")


def train_model(symbol):
    try:
        data, _ = fetch_data(symbol)

        scaler = MinMaxScaler()
        scaled = scaler.fit_transform(data)

        window = 60
        X, y = [], []
        for i in range(window, len(scaled)):
            X.append(scaled[i - window:i])
            y.append(scaled[i])

        X, y = np.array(X), np.array(y)

        model = tf.keras.models.Sequential([
            tf.keras.layers.LSTM(50, return_sequences=True, input_shape=(X.shape[1], 1)),
            tf.keras.layers.LSTM(50),
            tf.keras.layers.Dense(1)
        ])
        model.compile(optimizer='adam', loss='mean_squared_error')
        model.fit(X, y, epochs=5, batch_size=32, verbose=0)

        os.makedirs("models", exist_ok=True)
        os.makedirs("scalers", exist_ok=True)
        model.save(DEFAULT_MODEL_PATH)
        joblib.dump(scaler, DEFAULT_SCALER_PATH)

        return {"message": f"Model trained and saved as default."}
    except Exception as e:
        raise Exception(f"Could not fetch or process stock data: {str(e)}")


def predict_stock(symbol, days=10):
    try:
        if not os.path.exists(DEFAULT_MODEL_PATH) or not os.path.exists(DEFAULT_SCALER_PATH):
            raise Exception("Default model or scaler not found. Please train the model first.")

        data, df = fetch_data(symbol)

        model = tf.keras.models.load_model(DEFAULT_MODEL_PATH)
        scaler = joblib.load(DEFAULT_SCALER_PATH)

        scaled = scaler.transform(data)

        window = 60
        if len(scaled) < window:
            raise Exception("Not enough data to predict.")

        last_seq = scaled[-window:]
        preds = []

        for _ in range(days):
            inp = last_seq.reshape(1, window, 1)
            pred = model.predict(inp, verbose=0)[0][0]
            preds.append(pred)
            last_seq = np.append(last_seq[1:], [[pred]], axis=0)

        preds = scaler.inverse_transform(np.array(preds).reshape(-1, 1)).flatten()

        start_date = df.index[-1] + datetime.timedelta(days=1)
        dates = [start_date + datetime.timedelta(days=i) for i in range(days)]

        return {
            "predicted": [round(p, 2) for p in preds],
            "dates": [d.strftime("%Y-%m-%d") for d in dates],
            "actual": [round(float(x), 2) for x in data[-days:].flatten()]
        }

    except Exception as e:
        raise Exception(f"Could not fetch or process stock data: {str(e)}")
