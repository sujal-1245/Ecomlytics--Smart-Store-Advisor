"""
Ecomlytics - ML Engine
Models: Revenue Forecasting (Linear Reg + ARIMA-like), Anomaly Detection (IsolationForest + Z-score), 
        Product Segmentation (K-Means)
"""
import json
import math
import random
from collections import defaultdict

random.seed(42)

# ─────────────────────────────────────────────
# UTILITIES
# ─────────────────────────────────────────────

def mean(lst): return sum(lst) / len(lst) if lst else 0
def std(lst):
    if len(lst) < 2: return 0
    m = mean(lst)
    return math.sqrt(sum((x - m) ** 2 for x in lst) / len(lst))

def mae(actual, predicted):
    return mean([abs(a - p) for a, p in zip(actual, predicted)])

def rmse(actual, predicted):
    return math.sqrt(mean([(a - p) ** 2 for a, p in zip(actual, predicted)]))

# ─────────────────────────────────────────────
# MODEL 1: REVENUE FORECASTING
# ─────────────────────────────────────────────

class LinearRegressionForecaster:
    """Simple OLS linear regression for time-series forecasting"""
    def __init__(self):
        self.slope = 0
        self.intercept = 0
        self.train_mae = 0
        self.train_rmse = 0

    def fit(self, y):
        n = len(y)
        x = list(range(n))
        mx, my = mean(x), mean(y)
        num = sum((xi - mx) * (yi - my) for xi, yi in zip(x, y))
        den = sum((xi - mx) ** 2 for xi in x)
        self.slope = num / den if den != 0 else 0
        self.intercept = my - self.slope * mx
        preds = [self.intercept + self.slope * xi for xi in x]
        self.train_mae = mae(y, preds)
        self.train_rmse = rmse(y, preds)
        return self

    def predict(self, start_idx, steps=30):
        return [self.intercept + self.slope * (start_idx + i) for i in range(steps)]


class ARIMALikeForecaster:
    """
    Simplified ARIMA-like model using:
    - AR(3): autoregressive component with 3 lags
    - Moving average smoothing (MA window)
    - Drift term
    """
    def __init__(self, ar_lags=3, ma_window=7):
        self.ar_lags = ar_lags
        self.ma_window = ma_window
        self.ar_coeffs = []
        self.drift = 0
        self.train_mae = 0
        self.train_rmse = 0
        self.history = []

    def fit(self, y):
        self.history = list(y)
        n = len(y)
        lags = self.ar_lags
        
        # Estimate AR coefficients using Yule-Walker style
        r = [1.0]
        for k in range(1, lags + 1):
            yk = mean(y)
            cov = sum((y[i] - yk) * (y[i - k] - yk) for i in range(k, n)) / n
            var = sum((yi - yk) ** 2 for yi in y) / n
            r.append(cov / var if var > 0 else 0)
        
        self.ar_coeffs = [r[i] * 0.3 for i in range(1, lags + 1)]
        
        # Drift: average change over last 30 periods
        window = min(30, n - 1)
        self.drift = (y[-1] - y[-1 - window]) / window if window > 0 else 0
        
        # Training predictions
        preds = []
        for i in range(lags, n):
            ma = mean(y[max(0, i - self.ma_window):i])
            ar_term = sum(self.ar_coeffs[j] * y[i - j - 1] for j in range(lags))
            pred = ma * 0.5 + ar_term * 0.3 + self.drift * 0.2 + mean(y) * 0.0
            preds.append(pred)
        
        actual = y[lags:]
        self.train_mae = mae(actual, preds)
        self.train_rmse = rmse(actual, preds)
        return self

    def predict(self, steps=30):
        hist = list(self.history)
        forecasts = []
        lags = self.ar_lags
        for _ in range(steps):
            ma = mean(hist[-self.ma_window:])
            ar_term = sum(self.ar_coeffs[j] * hist[-j - 1] for j in range(lags))
            noise = random.gauss(0, std(hist[-30:]) * 0.05)
            pred = ma * 0.6 + ar_term * 0.3 + self.drift + noise
            forecasts.append(max(0, pred))
            hist.append(pred)
        return forecasts


def run_forecasting(daily_aggregates):
    revenues = [d["revenue"] for d in daily_aggregates]
    n = len(revenues)
    train_size = int(n * 0.8)
    
    train = revenues[:train_size]
    test = revenues[train_size:]
    
    # Linear regression
    lr = LinearRegressionForecaster()
    lr.fit(train)
    lr_test_preds = lr.predict(train_size, len(test))
    lr_test_mae = mae(test, lr_test_preds)
    lr_test_rmse = rmse(test, lr_test_preds)
    
    # ARIMA-like
    ar = ARIMALikeForecaster()
    ar.fit(train)
    ar_test_preds = ar.predict(len(test))
    ar_test_mae = mae(test, ar_test_preds)
    ar_test_rmse = rmse(test, ar_test_preds)
    
    # Select best model (lower RMSE wins)
    best_model_name = "ARIMA-like" if ar_test_rmse < lr_test_rmse else "Linear Regression"
    
    # Future forecast using best model (30 days)
    if best_model_name == "ARIMA-like":
        ar_full = ARIMALikeForecaster()
        ar_full.fit(revenues)
        future_30 = ar_full.predict(30)
    else:
        lr_full = LinearRegressionForecaster()
        lr_full.fit(revenues)
        future_30 = lr_full.predict(n, 30)
    
    # Do-nothing impact
    avg_recent = mean(revenues[-14:])
    avg_30days_prior = mean(revenues[-44:-14])
    trend_pct = ((avg_recent - avg_30days_prior) / avg_30days_prior * 100) if avg_30days_prior > 0 else 0
    
    return {
        "model_comparison": {
            "linear_regression": {
                "test_mae": round(lr_test_mae, 2),
                "test_rmse": round(lr_test_rmse, 2),
                "description": "OLS regression fitting a straight trend line through revenue history"
            },
            "arima_like": {
                "test_mae": round(ar_test_mae, 2),
                "test_rmse": round(ar_test_rmse, 2),
                "description": "AR(3) + moving average hybrid capturing momentum and local patterns"
            },
            "best_model": best_model_name,
            "justification": f"{best_model_name} achieves lower RMSE ({min(lr_test_rmse, ar_test_rmse):.0f} vs {max(lr_test_rmse, ar_test_rmse):.0f}), indicating better fit to non-linear seasonal patterns"
        },
        "forecast_30_days": [round(v, 2) for v in future_30],
        "trend_pct_2weeks": round(trend_pct, 2),
        "do_nothing_impact": {
            "projected_monthly_change_pct": round(trend_pct * 2, 2),
            "message": f"If current trend continues, revenue may {'drop' if trend_pct < 0 else 'grow'} ~{abs(trend_pct * 2):.1f}% next month"
        }
    }


# ─────────────────────────────────────────────
# MODEL 2: ANOMALY DETECTION
# ─────────────────────────────────────────────

class IsolationForestSimple:
    """
    Simplified Isolation Forest:
    - Build random isolation trees
    - Score each point by average path length
    - Short path = anomaly (isolated quickly)
    """
    def __init__(self, n_trees=50, sample_size=32, contamination=0.05):
        self.n_trees = n_trees
        self.sample_size = sample_size
        self.contamination = contamination
        self.threshold = 0

    def _build_tree(self, data, depth=0, max_depth=8):
        if len(data) <= 1 or depth >= max_depth:
            return {"size": len(data)}
        split = random.uniform(min(data), max(data))
        left = [x for x in data if x < split]
        right = [x for x in data if x >= split]
        if not left or not right:
            return {"size": len(data)}
        return {
            "split": split,
            "left": self._build_tree(left, depth + 1, max_depth),
            "right": self._build_tree(right, depth + 1, max_depth),
        }

    def _path_length(self, tree, val, depth=0):
        if "split" not in tree:
            n = tree["size"]
            return depth + (2 * (math.log(n - 1) + 0.5772) - 2 * (n - 1) / n if n > 1 else 0)
        if val < tree["split"]:
            return self._path_length(tree["left"], val, depth + 1)
        return self._path_length(tree["right"], val, depth + 1)

    def _c(self, n):
        if n <= 1: return 0
        return 2 * (math.log(n - 1) + 0.5772) - 2 * (n - 1) / n

    def fit_predict(self, data):
        n = len(data)
        scores = []
        trees = []
        for _ in range(self.n_trees):
            sample = random.choices(data, k=min(self.sample_size, n))
            trees.append(self._build_tree(sample))
        
        for val in data:
            avg_path = mean([self._path_length(t, val) for t in trees])
            c = self._c(min(self.sample_size, n))
            score = 2 ** (-avg_path / c) if c > 0 else 0.5
            scores.append(score)
        
        threshold = sorted(scores, reverse=True)[max(1, int(n * self.contamination))]
        return scores, [s > threshold for s in scores]


def z_score_anomaly(data, threshold=2.5):
    m, s = mean(data), std(data)
    z_scores = [(x - m) / s if s > 0 else 0 for x in data]
    return z_scores, [abs(z) > threshold for z in z_scores]


def run_anomaly_detection(daily_aggregates):
    revenues = [d["revenue"] for d in daily_aggregates]
    dates = [d["date"] for d in daily_aggregates]
    
    # Isolation Forest
    iso = IsolationForestSimple(contamination=0.06)
    if_scores, if_flags = iso.fit_predict(revenues)
    
    # Z-score
    z_scores, z_flags = z_score_anomaly(revenues, threshold=2.5)
    
    anomalies = []
    for i, (date, rev) in enumerate(zip(dates, revenues)):
        if if_flags[i] or z_flags[i]:
            anomaly_type = "spike" if rev > mean(revenues) else "drop"
            anomalies.append({
                "date": date,
                "revenue": rev,
                "type": anomaly_type,
                "if_score": round(if_scores[i], 4),
                "z_score": round(z_scores[i], 4),
                "detected_by_isolation_forest": if_flags[i],
                "detected_by_zscore": z_flags[i],
                "agreed": if_flags[i] and z_flags[i],
            })
    
    agreement_count = sum(1 for a in anomalies if a["agreed"])
    
    return {
        "anomalies": sorted(anomalies, key=lambda x: abs(x["z_score"]), reverse=True),
        "model_comparison": {
            "isolation_forest": {
                "flagged": sum(if_flags),
                "description": "Tree-based unsupervised method; isolates outliers by average path length"
            },
            "z_score": {
                "flagged": sum(z_flags),
                "description": "Statistical method; flags points beyond 2.5 standard deviations"
            },
            "agreement_rate": round(agreement_count / max(1, len(anomalies)) * 100, 1),
            "note": "Points flagged by both methods are highest confidence anomalies"
        }
    }


# ─────────────────────────────────────────────
# MODEL 3: PRODUCT SEGMENTATION (K-MEANS)
# ─────────────────────────────────────────────

class KMeansSimple:
    def __init__(self, k=4, max_iter=100):
        self.k = k
        self.centroids = []
        self.labels = []
        self.inertia = 0

    def _dist(self, a, b):
        return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))

    def fit(self, data):
        # Init: k-means++ style
        self.centroids = [random.choice(data)]
        while len(self.centroids) < self.k:
            dists = [min(self._dist(p, c) ** 2 for c in self.centroids) for p in data]
            total = sum(dists)
            r = random.uniform(0, total)
            cumul = 0
            for p, d in zip(data, dists):
                cumul += d
                if cumul >= r:
                    self.centroids.append(p)
                    break

        for _ in range(self.max_iter if hasattr(self, 'max_iter') else 100):
            labels = [min(range(self.k), key=lambda ci: self._dist(p, self.centroids[ci])) for p in data]
            new_centroids = []
            for ci in range(self.k):
                cluster_pts = [data[i] for i in range(len(data)) if labels[i] == ci]
                if cluster_pts:
                    new_centroids.append([mean([p[d] for p in cluster_pts]) for d in range(len(data[0]))])
                else:
                    new_centroids.append(self.centroids[ci])
            if new_centroids == self.centroids:
                break
            self.centroids = new_centroids

        self.labels = [min(range(self.k), key=lambda ci: self._dist(p, self.centroids[ci])) for p in data]
        self.inertia = sum(self._dist(data[i], self.centroids[self.labels[i]]) ** 2 for i in range(len(data)))
        return self

    def silhouette_score(self, data):
        n = len(data)
        scores = []
        for i in range(n):
            cluster = self.labels[i]
            same = [data[j] for j in range(n) if self.labels[j] == cluster and j != i]
            a = mean([self._dist(data[i], p) for p in same]) if same else 0
            
            other_avgs = []
            for c in range(self.k):
                if c == cluster: continue
                other = [data[j] for j in range(n) if self.labels[j] == c]
                if other:
                    other_avgs.append(mean([self._dist(data[i], p) for p in other]))
            b = min(other_avgs) if other_avgs else 0
            
            s = (b - a) / max(a, b) if max(a, b) > 0 else 0
            scores.append(s)
        return mean(scores)


def normalize(values):
    mn, mx = min(values), max(values)
    if mx == mn: return [0.5] * len(values)
    return [(v - mn) / (mx - mn) for v in values]


def run_product_segmentation(product_aggregates):
    products = product_aggregates
    
    revenues = [p["revenue"] for p in products]
    conversions = [p["conversion_rate"] for p in products]
    views = [p["views"] for p in products]
    
    norm_rev = normalize(revenues)
    norm_conv = normalize(conversions)
    norm_views = normalize(views)
    
    data = [[norm_rev[i], norm_conv[i], norm_views[i]] for i in range(len(products))]
    
    # Elbow method
    elbow = {}
    for k in range(2, 7):
        km = KMeansSimple(k=k)
        km.fit(data)
        elbow[k] = round(km.inertia, 4)
    
    # Optimal k = 4 (best for star/cash cow/question mark/dog segmentation)
    optimal_k = 4
    km = KMeansSimple(k=optimal_k)
    km.fit(data)
    sil = km.silhouette_score(data)
    
    # Label clusters by centroid characteristics
    cluster_stats = {}
    for ci in range(optimal_k):
        idxs = [i for i, l in enumerate(km.labels) if l == ci]
        cluster_stats[ci] = {
            "avg_revenue": mean([revenues[i] for i in idxs]),
            "avg_conversion": mean([conversions[i] for i in idxs]),
            "avg_views": mean([views[i] for i in idxs]),
            "count": len(idxs),
        }
    
    # Map clusters to BCG-style names
    sorted_by_rev = sorted(cluster_stats.keys(), key=lambda c: cluster_stats[c]["avg_revenue"])
    segment_names = {}
    for rank, ci in enumerate(sorted_by_rev):
        cs = cluster_stats[ci]
        if cs["avg_revenue"] > mean(revenues) and cs["avg_conversion"] > mean(conversions):
            segment_names[ci] = "Star"
        elif cs["avg_revenue"] > mean(revenues) and cs["avg_conversion"] <= mean(conversions):
            segment_names[ci] = "Cash Cow"
        elif cs["avg_revenue"] <= mean(revenues) and cs["avg_conversion"] > mean(conversions):
            segment_names[ci] = "Rising Star"
        else:
            segment_names[ci] = "Underperformer"
    
    segmented_products = []
    for i, p in enumerate(products):
        ci = km.labels[i]
        segmented_products.append({
            **p,
            "cluster": ci,
            "segment": segment_names.get(ci, f"Cluster {ci}"),
        })
    
    return {
        "segmented_products": segmented_products,
        "elbow_data": [{"k": k, "inertia": v} for k, v in elbow.items()],
        "optimal_k": optimal_k,
        "silhouette_score": round(sil, 4),
        "cluster_profiles": {
            segment_names.get(ci, f"Cluster {ci}"): {
                "avg_revenue": round(cluster_stats[ci]["avg_revenue"], 2),
                "avg_conversion_rate": round(cluster_stats[ci]["avg_conversion"], 4),
                "avg_views": round(cluster_stats[ci]["avg_views"]),
                "count": cluster_stats[ci]["count"],
            }
            for ci in range(optimal_k)
        }
    }


# ─────────────────────────────────────────────
# MAIN: RUN ALL MODELS
# ─────────────────────────────────────────────

if __name__ == "__main__":
    with open("dataset.json") as f:
        dataset = json.load(f)
    
    print("Running Revenue Forecasting...")
    forecast_results = run_forecasting(dataset["daily_aggregates"])
    print(f"  Best model: {forecast_results['model_comparison']['best_model']}")
    print(f"  Trend: {forecast_results['trend_pct_2weeks']}%")
    
    print("Running Anomaly Detection...")
    anomaly_results = run_anomaly_detection(dataset["daily_aggregates"])
    print(f"  Anomalies found: {len(anomaly_results['anomalies'])}")
    
    print("Running Product Segmentation...")
    seg_results = run_product_segmentation(dataset["product_aggregates"])
    print(f"  Silhouette score: {seg_results['silhouette_score']}")
    
    ml_results = {
        "forecasting": forecast_results,
        "anomaly_detection": anomaly_results,
        "segmentation": seg_results,
    }
    
    with open("ml_results.json", "w") as f:
        json.dump(ml_results, f, indent=2)
    
    print("\nML results saved to ml_results.json")
