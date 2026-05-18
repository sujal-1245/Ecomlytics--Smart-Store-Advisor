import pandas as pd
import numpy as np


def clean_dataset(df):

    required = [
        "date",
        "product",
        "category",
        "views",
        "orders",
        "revenue",
        "price"
    ]

    missing = [
        col for col in required
        if col not in df.columns
    ]

    if missing:

        raise ValueError(
            f"Missing columns: {missing}"
        )

    df = df[required].copy()

    # DATE
    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    # NUMERIC
    numeric_cols = [
        "views",
        "orders",
        "revenue",
        "price"
    ]

    for col in numeric_cols:

        df[col] = pd.to_numeric(
            df[col],
            errors="coerce"
        )

    # REMOVE BAD ROWS
    df = df.dropna()

    # REMOVE NEGATIVES
    for col in numeric_cols:

        df = df[df[col] >= 0]

    # REMOVE IMPOSSIBLE ROWS
    df = df[df["views"] > 0]

    # FEATURE ENGINEERING
    df["conversion_rate"] = (
        df["orders"] / df["views"]
    ) * 100

    df["avg_order_value"] = np.where(
        df["orders"] > 0,
        df["revenue"] / df["orders"],
        0
    )

    # DATE FEATURES
    df["day_of_week"] = (
        df["date"].dt.day_name()
    )

    df["month"] = (
        df["date"].dt.month
    )

    df["year"] = (
        df["date"].dt.year
    )

    df = df.sort_values("date")

    df = df.reset_index(drop=True)

    print("\n===== PREPROCESSING REPORT =====")

    print(f"Rows after cleaning: {len(df)}")

    print(f"Date range: {df['date'].min()} → {df['date'].max()}")

    print(f"Categories: {df['category'].nunique()}")

    print(f"Products: {df['product'].nunique()}")

    print(
        f"Average conversion rate: "
        f"{round(df['conversion_rate'].mean(),2)}%"
    )

    print(
        f"Average order value: "
        f"{round(df['avg_order_value'].mean(),2)}"
    )

    print("================================\n")



    return df