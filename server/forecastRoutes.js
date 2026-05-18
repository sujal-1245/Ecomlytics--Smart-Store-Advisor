import express from "express";

import {
  getForecast
} from "./mlService.js";

const router = express.Router();

router.post("/", async (req, res) => {

  try {

    let revenue = [];

    // ─────────────────────────────────────────────
    // FORMAT 1
    // { revenue: [...] }
    // ─────────────────────────────────────────────

    if (
      req.body.revenue &&
      Array.isArray(req.body.revenue)
    ) {

      revenue = req.body.revenue;
    }

    // ─────────────────────────────────────────────
    // FORMAT 2
    // { daily: [{ revenue }] }
    // ─────────────────────────────────────────────

    else if (
      req.body.daily &&
      Array.isArray(req.body.daily)
    ) {

      revenue = req.body.daily.map(
        d => d.revenue
      );
    }

    // ─────────────────────────────────────────────

    else {

      return res.status(400).json({
        error: "Invalid request body"
      });
    }

    const result =
      await getForecast(revenue);

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Forecast failed"
    });
  }
});

export default router;