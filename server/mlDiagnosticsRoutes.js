import express from "express";

import {

  getForecast,

  getAnomalies,

  getClusters

} from "./mlService.js";

const router = express.Router();

router.post("/", async (req, res) => {

  try {

    const revenue =
      req.body.daily.map(
        d => d.revenue
      );

    const products =
      req.body.products || [];

    console.log(
      "\n===== RUNNING FULL ML DIAGNOSTICS =====\n"
    );

    // ─────────────────────
    // FORECAST
    // ─────────────────────

    const forecast =
      await getForecast(
        revenue
      );

    // ─────────────────────
    // ANOMALIES
    // ─────────────────────

    const anomalies =
      await getAnomalies(
        revenue
      );

    // ─────────────────────
    // CLUSTERING
    // ─────────────────────

    let clusters = {};

    if (products.length > 1) {

      clusters =
        await getClusters(
          products
        );
    }

    console.log(
      "\n===== ML DIAGNOSTICS COMPLETE =====\n"
    );

    res.json({

      success: true,

      forecast,

      anomalies,

      clusters
    });

  } catch (err) {

    console.error(
      "\nML DIAGNOSTICS ERROR:"
    );

    console.error(err);

    res.status(500).json({

      error:
        "Diagnostics failed"
    });
  }
});

export default router;