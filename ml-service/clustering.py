from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

import numpy as np

from collections import Counter


def cluster_products(products):

    try:

        if len(products) < 2:

            return {
                "error":
                "Need at least 2 products"
            }

        X = []

        for p in products:

            X.append([

                p["revenue"],

                p["orders"],

                p["views"],

                p["conversion_rate"],

                p.get(
                    "avg_order_value",
                    0
                )
            ])

        X = np.array(X)

        # SCALE FEATURES
        scaler = StandardScaler()

        X_scaled = scaler.fit_transform(X)

        n_clusters = min(
            4,
            len(products)
        )

        model = KMeans(
            n_clusters=n_clusters,
            random_state=42,
            n_init=10
        )

        clusters = model.fit_predict(
            X_scaled
        )

        cluster_names = {
            0: "Top Sellers",
            1: "Growth Products",
            2: "Low Conversion",
            3: "At Risk"
        }

        print(
            "\nCLUSTER DISTRIBUTION:"
        )

        print(Counter(clusters))

        result = []

        for i, p in enumerate(products):

            result.append({

                "product":
                    p["product"],

                "cluster":
                    int(clusters[i]),

                "label":
                    cluster_names.get(
                        int(clusters[i]),
                        "Unknown"
                    )
            })

        return {
            "clusters": result
        }

    except Exception as e:

        return {
            "error": str(e)
        }