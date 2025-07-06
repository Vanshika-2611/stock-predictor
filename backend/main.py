# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import train_model, predict_stock
import logging

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    filename="log.txt",
    filemode="a",
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# Request schema
class StockRequest(BaseModel):
    symbol: str
    days: int = 10


@app.post("/train")
def train(data: StockRequest):
    logging.info(f"Training requested for {data.symbol}")
    try:
        result = train_model(data.symbol)
        logging.info(f"Training completed: {result}")
        return result
    except Exception as e:
        logging.exception("Training failed")
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@app.post("/predict")
def predict(data: StockRequest):
    logging.info(f"Prediction request received for {data.symbol}")
    try:
        result = predict_stock(data.symbol, data.days)
        logging.info("Prediction successful")
        return result
    except Exception as e:
        logging.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/logs")
def get_logs():
    try:
        with open("log.txt", "r") as f:
            return {"logs": f.readlines()[-100:]}  # return last 100 logs
    except FileNotFoundError:
        return {"logs": []}
