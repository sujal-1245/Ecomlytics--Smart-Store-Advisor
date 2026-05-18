from sklearn.ensemble import IsolationForest
import numpy as np


def detect_anomalies(revenue):

    try:

        if len(revenue) < 5:

            return {
                "error": "Not enough data"
            }

        arr = np.array(
            revenue
        ).reshape(-1,1)

        model = IsolationForest(
            contamination=0.08,
            random_state=42
        )

        preds = model.fit_predict(arr)

        anomalies = []

        for i, p in enumerate(preds):

            if p == -1:

                anomalies.append({
                    "index": i,
                    "value": float(revenue[i])
                })

        print(
            f"\nDetected {len(anomalies)} anomalies\n"
        )

        return {
            "anomalies": anomalies
        }

    except Exception as e:

        return {
            "error": str(e)
        }