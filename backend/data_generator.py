"""
Ecomlytics - Synthetic E-Commerce Dataset Generator
Generates realistic sales data with trends, seasonality, and anomalies
"""
import json
import random
import math
from datetime import datetime, timedelta

random.seed(42)

CATEGORIES = ["Electronics", "Clothing", "Home & Kitchen", "Beauty", "Sports", "Books"]
PRODUCTS = {
    "Electronics": ["Wireless Earbuds", "Bluetooth Speaker", "Smart Watch", "USB Hub", "Webcam"],
    "Clothing": ["Running Shoes", "Denim Jacket", "Summer Dress", "Hoodie", "Yoga Pants"],
    "Home & Kitchen": ["Air Fryer", "Coffee Maker", "Knife Set", "Blender", "Storage Bins"],
    "Beauty": ["Face Serum", "Hair Mask", "Sunscreen SPF50", "Lipstick Set", "Eye Cream"],
    "Sports": ["Resistance Bands", "Foam Roller", "Jump Rope", "Water Bottle", "Gym Gloves"],
    "Books": ["Python Cookbook", "Atomic Habits", "Deep Work", "Zero to One", "The Lean Startup"],
}

PRICES = {
    "Wireless Earbuds": 2499, "Bluetooth Speaker": 1899, "Smart Watch": 4999, "USB Hub": 799, "Webcam": 1499,
    "Running Shoes": 3499, "Denim Jacket": 2199, "Summer Dress": 1299, "Hoodie": 1599, "Yoga Pants": 999,
    "Air Fryer": 3999, "Coffee Maker": 2799, "Knife Set": 1499, "Blender": 2199, "Storage Bins": 699,
    "Face Serum": 899, "Hair Mask": 499, "Sunscreen SPF50": 349, "Lipstick Set": 799, "Eye Cream": 649,
    "Resistance Bands": 499, "Foam Roller": 699, "Jump Rope": 299, "Water Bottle": 399, "Gym Gloves": 349,
    "Python Cookbook": 599, "Atomic Habits": 399, "Deep Work": 349, "Zero to One": 379, "The Lean Startup": 359,
}

def generate_dataset(days=90):
    start_date = datetime.now() - timedelta(days=days)
    all_products = [(p, cat) for cat, products in PRODUCTS.items() for p in products]
    
    # Product base performance (some are stars, some are dogs)
    product_multiplier = {}
    for p, cat in all_products:
        if p in ["Wireless Earbuds", "Smart Watch", "Air Fryer", "Running Shoes"]:
            product_multiplier[p] = random.uniform(2.5, 4.0)  # stars
        elif p in ["USB Hub", "Storage Bins", "Jump Rope", "Eye Cream"]:
            product_multiplier[p] = random.uniform(0.2, 0.5)  # dogs
        else:
            product_multiplier[p] = random.uniform(0.8, 2.0)
    
    daily_records = []
    
    for day_offset in range(days):
        current_date = start_date + timedelta(days=day_offset)
        day_of_week = current_date.weekday()
        
        # Weekly seasonality: weekends boost
        week_factor = 1.3 if day_of_week >= 5 else 1.0
        
        # Trend: slight overall decline in last 30 days (to create a problem to diagnose)
        trend = 1.0
        if day_offset > 60:
            trend = 1.0 - (day_offset - 60) * 0.008  # -0.8% per day for last 30 days
        
        # Inject anomaly: day 45 had a spike (flash sale)
        anomaly_factor = 3.5 if 44 <= day_offset <= 46 else 1.0
        
        # Inject anomaly: day 75 had a drop (site issue)
        if 74 <= day_offset <= 76:
            anomaly_factor = 0.2
        
        for product, category in all_products:
            base_views = random.randint(80, 400)
            base_orders = max(1, int(base_views * random.uniform(0.03, 0.12)))
            
            mult = product_multiplier[product]
            views = int(base_views * mult * week_factor * trend * anomaly_factor * random.uniform(0.85, 1.15))
            orders = int(base_orders * mult * week_factor * trend * anomaly_factor * random.uniform(0.7, 1.3))
            orders = max(0, orders)
            
            price = PRICES[product]
            revenue = orders * price * random.uniform(0.95, 1.05)
            
            # Conversion rate
            conversion_rate = (orders / views * 100) if views > 0 else 0
            
            daily_records.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "product": product,
                "category": category,
                "views": views,
                "orders": orders,
                "revenue": round(revenue, 2),
                "price": price,
                "conversion_rate": round(conversion_rate, 4),
            })
    
    return daily_records

def aggregate_by_day(records):
    day_map = {}
    for r in records:
        d = r["date"]
        if d not in day_map:
            day_map[d] = {"date": d, "revenue": 0, "orders": 0, "views": 0}
        day_map[d]["revenue"] += r["revenue"]
        day_map[d]["orders"] += r["orders"]
        day_map[d]["views"] += r["views"]
    result = sorted(day_map.values(), key=lambda x: x["date"])
    for r in result:
        r["revenue"] = round(r["revenue"], 2)
        r["conversion_rate"] = round(r["orders"] / r["views"] * 100, 4) if r["views"] > 0 else 0
    return result

def aggregate_by_product(records):
    prod_map = {}
    for r in records:
        p = r["product"]
        if p not in prod_map:
            prod_map[p] = {"product": p, "category": r["category"], "revenue": 0, "orders": 0, "views": 0, "price": r["price"]}
        prod_map[p]["revenue"] += r["revenue"]
        prod_map[p]["orders"] += r["orders"]
        prod_map[p]["views"] += r["views"]
    result = list(prod_map.values())
    for r in result:
        r["revenue"] = round(r["revenue"], 2)
        r["conversion_rate"] = round(r["orders"] / r["views"] * 100, 4) if r["views"] > 0 else 0
    return sorted(result, key=lambda x: -x["revenue"])

def aggregate_by_category(records):
    cat_map = {}
    for r in records:
        c = r["category"]
        if c not in cat_map:
            cat_map[c] = {"category": c, "revenue": 0, "orders": 0, "views": 0}
        cat_map[c]["revenue"] += r["revenue"]
        cat_map[c]["orders"] += r["orders"]
        cat_map[c]["views"] += r["views"]
    result = list(cat_map.values())
    for r in result:
        r["revenue"] = round(r["revenue"], 2)
        r["conversion_rate"] = round(r["orders"] / r["views"] * 100, 4) if r["views"] > 0 else 0
    return sorted(result, key=lambda x: -x["revenue"])

if __name__ == "__main__":
    records = generate_dataset(90)
    daily = aggregate_by_day(records)
    products = aggregate_by_product(records)
    categories = aggregate_by_category(records)
    
    dataset = {
        "raw_records": records,
        "daily_aggregates": daily,
        "product_aggregates": products,
        "category_aggregates": categories,
    }
    
    with open("dataset.json", "w") as f:
        json.dump(dataset, f, indent=2)
    print(f"Generated {len(records)} records, {len(daily)} days, {len(products)} products")
