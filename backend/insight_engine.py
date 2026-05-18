"""
Ecomlytics - Insight Engine
Generates smart insights, root cause analysis, recommendations, and decision score
from data + ML outputs
"""
import json
import math
from collections import defaultdict

def mean(lst): return sum(lst) / len(lst) if lst else 0

# ─────────────────────────────────────────────
# SMART INSIGHTS (Rule-Based)
# ─────────────────────────────────────────────

def generate_smart_insights(dataset, ml_results):
    insights = []
    products = dataset["product_aggregates"]
    categories = dataset["category_aggregates"]
    daily = dataset["daily_aggregates"]
    segmented = ml_results["segmentation"]["segmented_products"]
    anomalies = ml_results["anomaly_detection"]["anomalies"]
    forecast = ml_results["forecasting"]
    
    total_revenue = sum(p["revenue"] for p in products)
    
    # 1. Pareto - top 20% products driving revenue
    sorted_prods = sorted(products, key=lambda x: -x["revenue"])
    top_20_count = max(1, len(sorted_prods) // 5)
    top_20_revenue = sum(p["revenue"] for p in sorted_prods[:top_20_count])
    pareto_pct = round(top_20_revenue / total_revenue * 100, 1)
    insights.append({
        "id": "pareto_rule",
        "type": "concentration",
        "severity": "warning" if pareto_pct > 70 else "info",
        "title": f"Top {top_20_count} products drive {pareto_pct}% of revenue",
        "detail": f"{sorted_prods[0]['product']} and {sorted_prods[1]['product']} alone account for the majority of sales. High concentration risk.",
        "metric": pareto_pct,
        "products": [p["product"] for p in sorted_prods[:top_20_count]],
        "category": "Product Risk",
    })
    
    # 2. High views but low conversion
    avg_conv = mean([p["conversion_rate"] for p in products])
    high_view_low_conv = [
        p for p in products
        if p["views"] > mean([x["views"] for x in products]) * 1.2
        and p["conversion_rate"] < avg_conv * 0.6
    ]
    if high_view_low_conv:
        insights.append({
            "id": "high_view_low_conv",
            "type": "opportunity",
            "severity": "warning",
            "title": f"{len(high_view_low_conv)} products have high traffic but low conversions",
            "detail": f"{high_view_low_conv[0]['product']} gets strong views but converts at only {high_view_low_conv[0]['conversion_rate']:.2f}% — pricing or listing quality may be the issue.",
            "products": [p["product"] for p in high_view_low_conv[:3]],
            "category": "Conversion",
        })
    
    # 3. Revenue trend
    trend = forecast["trend_pct_2weeks"]
    insights.append({
        "id": "revenue_trend",
        "type": "trend",
        "severity": "critical" if trend < -10 else "warning" if trend < 0 else "positive",
        "title": f"Revenue is {'declining' if trend < 0 else 'growing'} {abs(trend):.1f}% over last 2 weeks",
        "detail": forecast["do_nothing_impact"]["message"],
        "metric": trend,
        "category": "Revenue",
    })
    
    # 4. Underperforming category
    sorted_cats = sorted(categories, key=lambda x: x["conversion_rate"])
    worst_cat = sorted_cats[0]
    best_cat = sorted_cats[-1]
    insights.append({
        "id": "category_conversion",
        "type": "performance",
        "severity": "warning",
        "title": f"{worst_cat['category']} has the lowest conversion rate ({worst_cat['conversion_rate']:.2f}%)",
        "detail": f"Compared to {best_cat['category']} at {best_cat['conversion_rate']:.2f}%, {worst_cat['category']} is significantly underperforming. Review pricing and product listings.",
        "category": "Category",
    })
    
    # 5. Anomalies detected
    if anomalies:
        drops = [a for a in anomalies if a["type"] == "drop"]
        if drops:
            worst = drops[0]
            insights.append({
                "id": "anomaly_drop",
                "type": "anomaly",
                "severity": "critical",
                "title": f"Abnormal revenue drop detected on {worst['date']}",
                "detail": f"Revenue fell to ₹{worst['revenue']:,.0f} — significantly below normal. Both Isolation Forest and Z-score models flagged this.",
                "date": worst["date"],
                "category": "Anomaly",
            })
    
    # 6. ML-detected underperformers
    underperformers = [p for p in segmented if p["segment"] == "Underperformer"]
    if underperformers:
        insights.append({
            "id": "ml_underperformers",
            "type": "risk",
            "severity": "warning",
            "title": f"{len(underperformers)} products identified as underperformers by ML clustering",
            "detail": f"K-Means segmentation identified {', '.join([p['product'] for p in underperformers[:3]])} as low-revenue, low-conversion products. Consider discontinuing or promoting.",
            "products": [p["product"] for p in underperformers],
            "category": "ML Insight",
        })
    
    # 7. Stars
    stars = [p for p in segmented if p["segment"] == "Star"]
    if stars:
        insights.append({
            "id": "ml_stars",
            "type": "positive",
            "severity": "positive",
            "title": f"{len(stars)} star products identified — maximize their potential",
            "detail": f"{', '.join([p['product'] for p in stars[:3]])} show both high revenue and strong conversions. These are your business drivers.",
            "products": [p["product"] for p in stars],
            "category": "ML Insight",
        })
    
    return sorted(insights, key=lambda x: {"critical": 0, "warning": 1, "info": 2, "positive": 3}.get(x["severity"], 2))


# ─────────────────────────────────────────────
# ROOT CAUSE ANALYSIS
# ─────────────────────────────────────────────

def run_root_cause_analysis(dataset, ml_results):
    daily = dataset["daily_aggregates"]
    raw = dataset["raw_records"]
    
    recent = daily[-14:]
    prior = daily[-28:-14]
    
    recent_rev = mean([d["revenue"] for d in recent])
    prior_rev = mean([d["revenue"] for d in prior])
    change_pct = ((recent_rev - prior_rev) / prior_rev * 100) if prior_rev > 0 else 0
    
    # Category-level breakdown
    cat_recent = defaultdict(lambda: {"revenue": 0, "orders": 0})
    cat_prior = defaultdict(lambda: {"revenue": 0, "orders": 0})
    
    recent_dates = {d["date"] for d in recent}
    prior_dates = {d["date"] for d in prior}
    
    for r in raw:
        if r["date"] in recent_dates:
            cat_recent[r["category"]]["revenue"] += r["revenue"]
            cat_recent[r["category"]]["orders"] += r["orders"]
        elif r["date"] in prior_dates:
            cat_prior[r["category"]]["revenue"] += r["revenue"]
            cat_prior[r["category"]]["orders"] += r["orders"]
    
    category_impacts = []
    for cat in cat_recent:
        r = cat_recent[cat]["revenue"]
        p = cat_prior[cat]["revenue"]
        chg = ((r - p) / p * 100) if p > 0 else 0
        category_impacts.append({
            "category": cat,
            "recent_revenue": round(r, 2),
            "prior_revenue": round(p, 2),
            "change_pct": round(chg, 1),
        })
    category_impacts.sort(key=lambda x: x["change_pct"])
    
    # Product-level contributors (worst performers)
    prod_recent = defaultdict(lambda: {"revenue": 0, "orders": 0, "category": ""})
    prod_prior = defaultdict(lambda: {"revenue": 0, "orders": 0})
    
    for r in raw:
        if r["date"] in recent_dates:
            prod_recent[r["product"]]["revenue"] += r["revenue"]
            prod_recent[r["product"]]["category"] = r["category"]
        elif r["date"] in prior_dates:
            prod_prior[r["product"]]["revenue"] += r["revenue"]
    
    product_contributors = []
    for prod in prod_recent:
        r = prod_recent[prod]["revenue"]
        p = prod_prior[prod]["revenue"]
        chg = ((r - p) / p * 100) if p > 0 else 0
        product_contributors.append({
            "product": prod,
            "category": prod_recent[prod]["category"],
            "recent_revenue": round(r, 2),
            "prior_revenue": round(p, 2),
            "change_pct": round(chg, 1),
        })
    product_contributors.sort(key=lambda x: x["change_pct"])
    
    # Worst category and product
    worst_cat = category_impacts[0] if category_impacts else None
    worst_prod = product_contributors[0] if product_contributors else None
    
    narrative = ""
    if change_pct < 0:
        narrative = f"Sales dropped {abs(change_pct):.1f}% mainly due to {worst_cat['category'] if worst_cat else 'unknown category'}, driven by {worst_prod['product'] if worst_prod else 'unknown product'} in the last 14 days."
    elif change_pct > 0:
        narrative = f"Sales grew {change_pct:.1f}% with the strongest contribution from {category_impacts[-1]['category']} and {product_contributors[-1]['product']} in the last 14 days."
    else:
        narrative = "Sales are stable over the last 14 days with no significant directional change."
    
    return {
        "summary": {
            "revenue_change_pct": round(change_pct, 1),
            "narrative": narrative,
        },
        "category_impacts": category_impacts,
        "product_contributors": product_contributors[:10],
        "time_window": "last 14 days vs prior 14 days",
    }


# ─────────────────────────────────────────────
# RECOMMENDATION ENGINE
# ─────────────────────────────────────────────

def generate_recommendations(insights, segmentation, rca):
    recs = []
    
    for insight in insights:
        if insight["id"] == "high_view_low_conv":
            recs.append({
                "id": "rec_discount_low_conv",
                "linked_insight": insight["id"],
                "action": "Apply 10–15% discount",
                "targets": insight.get("products", [])[:3],
                "rationale": "High traffic signals demand; price may be blocking conversions.",
                "priority": "high",
                "expected_impact": "Conversion rate improvement of 2–4%",
                "type": "discount",
            })
        
        if insight["id"] == "ml_underperformers":
            recs.append({
                "id": "rec_remove_underperformers",
                "linked_insight": insight["id"],
                "action": "Review and consider removing underperforming SKUs",
                "targets": insight.get("products", [])[:3],
                "rationale": "Low revenue and low conversion — these products consume listing real estate without contributing meaningfully.",
                "priority": "medium",
                "expected_impact": "Cleaner catalog, improved average metrics",
                "type": "catalog",
            })
        
        if insight["id"] == "ml_stars":
            recs.append({
                "id": "rec_promote_stars",
                "linked_insight": insight["id"],
                "action": "Increase promotion budget for star products",
                "targets": insight.get("products", [])[:3],
                "rationale": "Star products have proven conversion + revenue. Higher ad spend directly compounds.",
                "priority": "high",
                "expected_impact": "Revenue uplift of 8–15% on star products",
                "type": "promotion",
            })
        
        if insight["id"] == "pareto_rule":
            recs.append({
                "id": "rec_diversify",
                "linked_insight": insight["id"],
                "action": "Diversify product portfolio to reduce concentration risk",
                "targets": insight.get("products", [])[:2],
                "rationale": "Over-reliance on a few products creates fragility. One product issue can tank overall performance.",
                "priority": "medium",
                "expected_impact": "Reduced business risk score",
                "type": "strategy",
            })
        
        if insight["id"] == "revenue_trend" and insight.get("metric", 0) < -5:
            recs.append({
                "id": "rec_trend_intervention",
                "linked_insight": insight["id"],
                "action": "Launch a targeted promotional campaign immediately",
                "targets": [],
                "rationale": f"Revenue has declined {abs(insight['metric']):.1f}% — passive monitoring will allow compounding decline.",
                "priority": "critical",
                "expected_impact": "Arrest decline; stabilize revenue within 7 days",
                "type": "promotion",
            })
    
    # RCA-based recommendation
    if rca["summary"]["revenue_change_pct"] < -5:
        worst_cat = rca["category_impacts"][0]["category"] if rca["category_impacts"] else "Electronics"
        recs.append({
            "id": "rec_rca_category",
            "linked_insight": "revenue_trend",
            "action": f"Focus recovery efforts on {worst_cat} category",
            "targets": [rca["product_contributors"][0]["product"]] if rca["product_contributors"] else [],
            "rationale": f"Root cause analysis identifies {worst_cat} as the primary drag on overall performance.",
            "priority": "high",
            "expected_impact": "Category-level revenue recovery",
            "type": "category_focus",
        })
    
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    return sorted(recs, key=lambda x: priority_order.get(x["priority"], 2))


# ─────────────────────────────────────────────
# DECISION SCORE
# ─────────────────────────────────────────────

def calculate_decision_score(dataset, ml_results, insights, rca):
    daily = dataset["daily_aggregates"]
    products = dataset["product_aggregates"]
    forecast = ml_results["forecasting"]
    anomalies = ml_results["anomaly_detection"]["anomalies"]
    
    scores = {}
    
    # 1. Revenue trend score (0-25)
    trend = forecast["trend_pct_2weeks"]
    if trend >= 5: scores["revenue_trend"] = 25
    elif trend >= 0: scores["revenue_trend"] = 20
    elif trend >= -5: scores["revenue_trend"] = 15
    elif trend >= -15: scores["revenue_trend"] = 8
    else: scores["revenue_trend"] = 3
    
    # 2. Conversion rate score (0-25)
    avg_conv = mean([d["conversion_rate"] for d in daily[-14:]])
    if avg_conv >= 5: scores["conversion_rate"] = 25
    elif avg_conv >= 3: scores["conversion_rate"] = 20
    elif avg_conv >= 2: scores["conversion_rate"] = 14
    else: scores["conversion_rate"] = 7
    
    # 3. Product concentration risk (0-25)
    total_rev = sum(p["revenue"] for p in products)
    sorted_prods = sorted(products, key=lambda x: -x["revenue"])
    top3_rev = sum(p["revenue"] for p in sorted_prods[:3])
    concentration = top3_rev / total_rev if total_rev > 0 else 1
    if concentration < 0.4: scores["concentration_risk"] = 25
    elif concentration < 0.55: scores["concentration_risk"] = 18
    elif concentration < 0.7: scores["concentration_risk"] = 12
    else: scores["concentration_risk"] = 5
    
    # 4. Anomaly penalty (0-25)
    recent_anomalies = [a for a in anomalies if a.get("agreed", False)]
    if len(recent_anomalies) == 0: scores["anomaly_health"] = 25
    elif len(recent_anomalies) == 1: scores["anomaly_health"] = 18
    elif len(recent_anomalies) == 2: scores["anomaly_health"] = 12
    else: scores["anomaly_health"] = 5
    
    total = sum(scores.values())
    
    if total >= 80: status = "Healthy"
    elif total >= 60: status = "Needs Attention"
    elif total >= 40: status = "At Risk"
    else: status = "Critical"
    
    explanation_parts = []
    if scores["revenue_trend"] < 15:
        explanation_parts.append(f"declining revenue trend ({trend:.1f}%)")
    if scores["concentration_risk"] < 15:
        explanation_parts.append("high dependency on few products")
    if scores["conversion_rate"] < 15:
        explanation_parts.append("weak conversion rates")
    if scores["anomaly_health"] < 18:
        explanation_parts.append("multiple anomalies detected")
    
    explanation = f"Business Health Score: {total}/100 — {status}. " + (
        "Driven by " + ", ".join(explanation_parts) if explanation_parts else "Overall metrics are healthy."
    )
    
    return {
        "total": total,
        "status": status,
        "components": scores,
        "explanation": explanation,
        "max_possible": 100,
    }


# ─────────────────────────────────────────────
# SCENARIO SIMULATOR
# ─────────────────────────────────────────────

def simulate_scenario(product_name, price_change_pct, discount_pct, products, forecast):
    product = next((p for p in products if p["product"] == product_name), None)
    if not product:
        return {"error": "Product not found"}
    
    base_revenue = product["revenue"]
    base_orders = product["orders"]
    base_conv = product["conversion_rate"]
    
    # Price elasticity: -0.8 (each 1% price increase → 0.8% demand drop)
    elasticity = -0.8
    demand_change = 1 + (price_change_pct * elasticity / 100)
    
    # Discount boosts conversion
    conv_boost = 1 + (discount_pct * 0.05)  # 5% conv boost per 1% discount
    
    new_conv = base_conv * conv_boost
    new_price = product["price"] * (1 + price_change_pct / 100) * (1 - discount_pct / 100)
    new_orders = base_orders * demand_change * conv_boost
    new_revenue = new_orders * new_price
    
    revenue_change = new_revenue - base_revenue
    revenue_change_pct = (revenue_change / base_revenue * 100) if base_revenue > 0 else 0
    
    return {
        "product": product_name,
        "original": {"revenue": round(base_revenue, 2), "orders": round(base_orders), "conversion_rate": round(base_conv, 4)},
        "simulated": {"revenue": round(new_revenue, 2), "orders": round(new_orders), "conversion_rate": round(new_conv, 4)},
        "delta": {"revenue": round(revenue_change, 2), "revenue_pct": round(revenue_change_pct, 1)},
        "inputs": {"price_change_pct": price_change_pct, "discount_pct": discount_pct},
    }


# ─────────────────────────────────────────────
# AI COPILOT QUERY HANDLER
# ─────────────────────────────────────────────

def handle_copilot_query(query, insights, rca, recommendations, decision_score):
    query_lower = query.lower()
    
    response = {"query": query, "insights": [], "root_cause": None, "recommendations": [], "summary": ""}
    
    if any(w in query_lower for w in ["drop", "declin", "fall", "down", "worse", "bad"]):
        relevant_insights = [i for i in insights if i["severity"] in ["critical", "warning"]][:3]
        response["insights"] = relevant_insights
        response["root_cause"] = rca["summary"]["narrative"]
        response["recommendations"] = [r for r in recommendations if r["priority"] in ["critical", "high"]][:3]
        response["summary"] = f"Your revenue has {rca['summary']['revenue_change_pct']:+.1f}% change over 2 weeks. {rca['summary']['narrative']}"
    
    elif any(w in query_lower for w in ["best", "top", "star", "perform"]):
        relevant_insights = [i for i in insights if i.get("id") in ["ml_stars", "pareto_rule"]]
        response["insights"] = relevant_insights
        response["summary"] = "Here are your top-performing products and insights."
        response["recommendations"] = [r for r in recommendations if r.get("type") == "promotion"][:2]
    
    elif any(w in query_lower for w in ["convert", "traffic", "view"]):
        relevant_insights = [i for i in insights if i.get("id") == "high_view_low_conv"]
        response["insights"] = relevant_insights
        response["recommendations"] = [r for r in recommendations if r.get("type") == "discount"][:2]
        response["summary"] = "Conversion insights and actions identified."
    
    elif any(w in query_lower for w in ["score", "health", "overall"]):
        response["summary"] = decision_score["explanation"]
        response["insights"] = insights[:2]
        response["recommendations"] = recommendations[:2]
    
    else:
        response["insights"] = insights[:3]
        response["root_cause"] = rca["summary"]["narrative"]
        response["recommendations"] = recommendations[:3]
        response["summary"] = f"Overall business health: {decision_score['total']}/100 ({decision_score['status']}). {rca['summary']['narrative']}"
    
    return response


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

if __name__ == "__main__":
    with open("dataset.json") as f:
        dataset = json.load(f)
    with open("ml_results.json") as f:
        ml_results = json.load(f)
    
    print("Generating smart insights...")
    insights = generate_smart_insights(dataset, ml_results)
    print(f"  {len(insights)} insights generated")
    
    print("Running root cause analysis...")
    rca = run_root_cause_analysis(dataset, ml_results)
    print(f"  Narrative: {rca['summary']['narrative']}")
    
    print("Generating recommendations...")
    recommendations = generate_recommendations(insights, ml_results["segmentation"], rca)
    print(f"  {len(recommendations)} recommendations generated")
    
    print("Calculating decision score...")
    decision_score = calculate_decision_score(dataset, ml_results, insights, rca)
    print(f"  Score: {decision_score['total']}/100 — {decision_score['status']}")
    
    # Test copilot
    copilot_test = handle_copilot_query("Why are my sales dropping?", insights, rca, recommendations, decision_score)
    
    engine_results = {
        "insights": insights,
        "rca": rca,
        "recommendations": recommendations,
        "decision_score": decision_score,
        "copilot_demo": copilot_test,
    }
    
    with open("engine_results.json", "w") as f:
        json.dump(engine_results, f, indent=2)
    
    print("\nInsight engine results saved to engine_results.json")
