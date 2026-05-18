from forecasting import generate_forecast
from anomalies import detect_anomalies
from clustering import cluster_products

import random

# ─────────────────────────────────────────────
# SAMPLE REVENUE
# ─────────────────────────────────────────────

revenue = [

    random.randint(1000, 10000)

    for _ in range(90)
]

# ─────────────────────────────────────────────
# SAMPLE PRODUCTS
# ─────────────────────────────────────────────

products = []

for i in range(30):

    views = random.randint(
        500,
        5000
    )

    orders = random.randint(
        10,
        300
    )

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
            round(
                (orders / views) * 100,
                2
            ),

        "avg_order_value":
            round(
                revenue_value / orders,
                2
            )
    })

# ─────────────────────────────────────────────
# RUN FORECASTING
# ─────────────────────────────────────────────

print(
    "\n===================================="
)

print(
    "TESTING FORECAST MODEL"
)

print(
    "====================================\n"
)

forecast = generate_forecast(
    revenue
)

print("\nFORECAST OUTPUT:\n")

print(forecast)

# ─────────────────────────────────────────────
# RUN ANOMALY DETECTION
# ─────────────────────────────────────────────

print(
    "\n===================================="
)

print(
    "TESTING ANOMALY DETECTION"
)

print(
    "====================================\n"
)

anomalies = detect_anomalies(
    revenue
)

print("\nANOMALY OUTPUT:\n")

print(anomalies)

# ─────────────────────────────────────────────
# RUN CLUSTERING
# ─────────────────────────────────────────────

print(
    "\n===================================="
)

print(
    "TESTING PRODUCT CLUSTERING"
)

print(
    "====================================\n"
)

clusters = cluster_products(
    products
)

print("\nCLUSTER OUTPUT:\n")

print(clusters)

# ─────────────────────────────────────────────
# FINISHED
# ─────────────────────────────────────────────

print(
    "\n===================================="
)

print(
    "ALL ML TESTS COMPLETE"
)

print(
    "====================================\n"
)