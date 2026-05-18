from forecasting import generate_forecast
from anomalies import detect_anomalies
from clustering import cluster_products

import random

# ─────────────────────────────
# SAMPLE REVENUE
# ─────────────────────────────

revenue = [

    random.randint(1000, 10000)

    for _ in range(90)
]

# ─────────────────────────────
# SAMPLE PRODUCTS
# ─────────────────────────────

products = []

for i in range(30):

    views = random.randint(500, 5000)

    orders = random.randint(10, 300)

    revenue_value = random.randint(
        5000,
        100000
    )

    products.append({

        "product":
            f"Product {i}",

        "revenue":
            revenue_value,

        "orders":
            orders,

        "views":
            views,

        "conversion_rate":
            (orders / views) * 100,

        "avg_order_value":
            revenue_value / orders
    })

# ─────────────────────────────
# RUN EVERYTHING
# ─────────────────────────────

print(
    "\n===== TESTING FORECAST ====="
)

forecast =
    generate_forecast(revenue)

print(forecast)

print(
    "\n===== TESTING ANOMALIES ====="
)

anomalies =
    detect_anomalies(revenue)

print(anomalies)

print(
    "\n===== TESTING CLUSTERING ====="
)

clusters = cluster_products(products)

print(clusters)

print(
    "\n===== ALL ML TESTS COMPLETE =====\n"
)