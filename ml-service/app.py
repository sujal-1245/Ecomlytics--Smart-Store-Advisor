from fastapi import FastAPI
from pydantic import BaseModel

import pandas as pd

from forecasting import generate_forecast
from anomalies import detect_anomalies
from clustering import cluster_products

from preprocessing import clean_dataset


app = FastAPI()


# ─────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────

@app.get("/")
def root():

    return {
        "status":
        "Ecomlytics ML Service Running"
    }


# ─────────────────────────────────────────────
# REQUEST SCHEMAS
# ─────────────────────────────────────────────

class ForecastRequest(BaseModel):

    revenue: list


class DatasetForecastRequest(BaseModel):

    data: list


class AnomalyRequest(BaseModel):

    revenue: list


class ClusterRequest(BaseModel):

    products: list


# ─────────────────────────────────────────────
# SIMPLE FORECAST
# Direct revenue forecasting
# ─────────────────────────────────────────────

@app.post("/forecast")
def forecast(req: ForecastRequest):

    try:

        result = generate_forecast(
            req.revenue
        )

        return result

    except Exception as e:

        return {
            "error": str(e)
        }


# ─────────────────────────────────────────────
# DATASET FORECAST
# Full ecommerce dataset pipeline
# ─────────────────────────────────────────────

@app.post("/dataset-forecast")
def dataset_forecast(
    req: DatasetForecastRequest
):

    try:

        df = pd.DataFrame(req.data)

        df = clean_dataset(df)

        daily_revenue = (

            df.groupby("date")["revenue"]
            .sum()
            .sort_index()
        )

        result = generate_forecast(
            daily_revenue.tolist()
        )

        return result

    except Exception as e:

        return {
            "error": str(e)
        }


# ─────────────────────────────────────────────
# ANOMALY DETECTION
# ─────────────────────────────────────────────

@app.post("/anomalies")
def anomalies(req: AnomalyRequest):

    try:

        result = detect_anomalies(
            req.revenue
        )

        return result

    except Exception as e:

        return {
            "error": str(e)
        }


# ─────────────────────────────────────────────
# PRODUCT CLUSTERING
# ─────────────────────────────────────────────

@app.post("/cluster-products")
def cluster(req: ClusterRequest):

    try:

        result = cluster_products(
            req.products
        )

        return result

    except Exception as e:

        return {
            "error": str(e)
        }