import pandas as pd
import numpy as np

from statsmodels.tsa.statespace.sarimax import SARIMAX

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error
)

from math import sqrt


def generate_forecast(revenue):

    try:

        if len(revenue) < 5:

            return {
                "error": "Not enough data for forecasting"
            }

        series = pd.Series(
            revenue
        ).astype(float)

        # SMALL DATA → ARIMA
        if len(series) < 14:

            model = SARIMAX(
                series,
                order=(1, 1, 1)
            )

        # LARGE DATA → SARIMA
        else:

            model = SARIMAX(
                series,
                order=(1, 1, 1),
                seasonal_order=(1, 1, 1, 7)
            )

        fit = model.fit(disp=False)

        forecast_steps = 14

        forecast = fit.forecast(
            forecast_steps
        )

        confidence = fit.get_forecast(
            forecast_steps
        ).conf_int()

        # METRICS
        if len(series) >= 7:

            test_size = min(
                7,
                len(series) // 3
            )

            actual = series[-test_size:]

            predicted = fit.predict(
                start=len(series) - test_size,
                end=len(series) - 1
            )

            mae = mean_absolute_error(
                actual,
                predicted
            )

            rmse = sqrt(
                mean_squared_error(
                    actual,
                    predicted
                )
            )

            mape = np.mean(
                np.abs(
                    (actual - predicted)
                    / actual
                )
            ) * 100

        else:

            mae = None
            rmse = None
            mape = None

        print("\n===== FORECAST METRICS =====")

        if mae is not None:

            print(f"MAE: {round(mae,2)}")
            print(f"RMSE: {round(rmse,2)}")
            print(f"MAPE: {float(round(mape,2))}%")

        else:

            print("Not enough data for metrics")

        print("============================\n")

        return {

            "forecast": [
                round(x, 2)
                for x in forecast.tolist()
            ],

            "lower_bound": [
                round(x, 2)
                for x in confidence.iloc[:,0].tolist()
            ],

            "upper_bound": [
                round(x, 2)
                for x in confidence.iloc[:,1].tolist()
            ],

            "metrics": {

                "MAE":
                    round(mae,2)
                    if mae is not None else None,

                "RMSE":
                    round(rmse,2)
                    if rmse is not None else None,

                "MAPE":
                    float(round(mape,2))
                    if mape is not None else None
            }
        }

    except Exception as e:

        print("\nFORECAST ERROR:")
        print(str(e))

        return {
            "error": str(e)
        }