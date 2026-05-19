import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import Lottie from "lottie-react";

import aiAnimation from "./lottie/ai.json";
import {
  FiUploadCloud,
  FiBarChart2,
  FiCpu,
  FiCheckCircle,
} from "react-icons/fi";

import {
  HiSparkles,
} from "react-icons/hi";
import Tilt from "react-parallax-tilt";
import CountUp from "react-countup";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n >= 1e7
    ? `₹${(n / 1e7).toFixed(1)}Cr`
    : n >= 1e5
      ? `₹${(n / 1e5).toFixed(1)}L`
      : `₹${Math.round(n).toLocaleString()}`;
const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const std = (arr) => {
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((x) => (x - m) ** 2)));
};

// ─── CSV PARSER ───────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const vals = line.split(",");
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = vals[i]?.trim() || "";
      });
      return obj;
    });
}

// ─── ANALYSIS ENGINE ─────────────────────────────────────────────────────────
function analyseData(rows) {
  // Normalise column names flexibly
  const sample = rows[0];
  const keys = Object.keys(sample);
  const findCol = (...names) =>
    keys.find((k) => names.some((n) => k.includes(n))) || null;

  const dateCol = findCol("date", "day", "time");
  const productCol = findCol("product", "item", "name", "sku");
  const categoryCol = findCol("category", "cat", "type", "department");
  const viewsCol = findCol("view", "visit", "impression", "traffic");
  const ordersCol = findCol(
    "order",
    "sale",
    "quantity",
    "sold",
    "purchase",
    "qty",
  );
  const revenueCol = findCol(
    "revenue",
    "amount",
    "total",
    "earning",
    "income",
    "gmv",
    "sales",
  );
  const priceCol = findCol("price", "rate", "mrp", "cost");

  if (!revenueCol && !ordersCol)
    throw new Error(
      "Could not find revenue or orders column. Please check your CSV format.",
    );
  if (!dateCol)
    throw new Error(
      "Could not find a date column. Please check your CSV format.",
    );

  // Build daily aggregates
  const byDate = {};
  const byProduct = {};
  const byCategory = {};

  rows.forEach((r) => {
    const date = r[dateCol] || "";
    const product = r[productCol] || "Unknown";
    const cat = r[categoryCol] || "General";
    const views = parseFloat(r[viewsCol]) || 0;
    const orders = parseFloat(r[ordersCol]) || 0;
    const revenue =
      parseFloat(r[revenueCol]) || orders * (parseFloat(r[priceCol]) || 0);
    const price = parseFloat(r[priceCol]) || 0;

    if (!byDate[date]) byDate[date] = { date, revenue: 0, orders: 0, views: 0 };
    byDate[date].revenue += revenue;
    byDate[date].orders += orders;
    byDate[date].views += views;

    if (!byProduct[product])
      byProduct[product] = {
        product,
        category: cat,
        revenue: 0,
        orders: 0,
        views: 0,
        price,
      };
    byProduct[product].revenue += revenue;
    byProduct[product].orders += orders;
    byProduct[product].views += views;

    if (!byCategory[cat])
      byCategory[cat] = { category: cat, revenue: 0, orders: 0, views: 0 };
    byCategory[cat].revenue += revenue;
    byCategory[cat].orders += orders;
    byCategory[cat].views += views;
  });

  const daily = Object.values(byDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      ...d,
      revenue: Math.round(d.revenue),
      conversion_rate:
        d.views > 0 ? +((d.orders / d.views) * 100).toFixed(2) : 0,
    }));
  const products = Object.values(byProduct)
    .sort((a, b) => b.revenue - a.revenue)
    .map((p) => ({
      ...p,
      revenue: Math.round(p.revenue),
      conversion_rate:
        p.views > 0 ? +((p.orders / p.views) * 100).toFixed(2) : 0,
    }));
  const categories = Object.values(byCategory)
    .sort((a, b) => b.revenue - a.revenue)
    .map((c) => ({
      ...c,
      revenue: Math.round(c.revenue),
      buying_rate: c.views > 0 ? +((c.orders / c.views) * 100).toFixed(2) : 0,
    }));

  // ── Metrics ──
  const totalRev = daily.reduce((a, d) => a + d.revenue, 0);
  const n = daily.length;
  const half = Math.floor(n / 2);
  const recentDays = daily.slice(-Math.min(14, half));
  const priorDays = daily.slice(-Math.min(28, n), -Math.min(14, half));
  const recentAvg = recentDays.length
    ? mean(recentDays.map((d) => d.revenue))
    : 0;
  const priorAvg = priorDays.length
    ? mean(priorDays.map((d) => d.revenue))
    : recentAvg;
  const trendPct = priorAvg
    ? +(((recentAvg - priorAvg) / priorAvg) * 100).toFixed(1)
    : 0;

  // ── Anomaly detection (z-score) ──
  const revArr = daily.map((d) => d.revenue);
  const revMean = mean(revArr);
  const revStd = std(revArr) || 1;
  const unusualDays = daily
    .filter((d) => Math.abs((d.revenue - revMean) / revStd) > 2)
    .map((d) => d.date);

  // ── Product segmentation ──
  const maxRev = Math.max(...products.map((p) => p.revenue)) || 1;
  const maxConv = Math.max(...products.map((p) => p.conversion_rate)) || 1;
  const avgRevP = mean(products.map((p) => p.revenue));
  const avgConv = mean(products.map((p) => p.conversion_rate));
  const segmented = products.map((p) => {
    let segment;
    if (p.revenue >= avgRevP && p.conversion_rate >= avgConv)
      segment = "Top Earner";
    else if (p.revenue < avgRevP * 0.3 && p.conversion_rate <= avgConv)
      segment = "Needs Review";
    else segment = "Growing";
    return { ...p, segment };
  });

  // ── Forecast (simple moving avg + drift) ──
  const last7 = daily.slice(-7).map((d) => d.revenue);
  const drift = n > 7 ? (daily[n - 1].revenue - daily[n - 7].revenue) / 7 : 0;
  const fcBase = Array.from({ length: 14 }, (_, i) =>
    Math.max(0, Math.round(mean(last7) + drift * (i + 1))),
  );
  const fcOpt = fcBase.map((v) => Math.round(v * 1.15));
  const fcPess = fcBase.map((v) => Math.round(v * 0.85));

  // ── Day of week ──
  const dowMap = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };
  const dowRev = {};
  daily.forEach((d) => {
    const dow = dowMap[new Date(d.date).getDay()];
    if (!dowRev[dow]) dowRev[dow] = [];
    dowRev[dow].push(d.revenue);
  });
  const dow = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    .filter((d) => dowRev[d])
    .map((d) => ({
      day: d,
      avg: Math.round(mean(dowRev[d]) / 1000),
    }));
  const bestDay = dow.reduce((a, b) => (a.avg > b.avg ? a : b), {
    day: "—",
    avg: 0,
  });

  // ── Concentration risk ──
  const top3Rev = segmented.slice(0, 3).reduce((a, p) => a + p.revenue, 0);
  const concPct = totalRev > 0 ? +((top3Rev / totalRev) * 100).toFixed(1) : 0;

  // ── Health score — balanced so no single metric dominates ──
  // Sales trend: needs strong growth to score high
  const tScore =
    trendPct >= 10
      ? 25
      : trendPct >= 3
        ? 20
        : trendPct >= 0
          ? 15
          : trendPct >= -10
            ? 8
            : 3;
  // Buying rate: capped at 20 max — a good buy rate alone doesn't mean a healthy business.
  // Also reduced 15% when trend is negative, because conversion can't offset falling sales.
  const avgBuyRate = categories.length
    ? mean(categories.map((c) => c.buying_rate))
    : 0;
  const bRaw =
    avgBuyRate >= 8 ? 20 : avgBuyRate >= 5 ? 16 : avgBuyRate >= 2 ? 10 : 4;
  const bScore = trendPct < 0 ? Math.round(bRaw * 0.85) : bRaw;
  // Concentration: 60%+ revenue in top 3 products is genuinely high risk
  const cScore = concPct < 35 ? 25 : concPct < 50 ? 18 : concPct < 65 ? 10 : 4;
  // Anomaly health: even 1-3 unusual days meaningfully lowers the score
  const aScore =
    unusualDays.length === 0
      ? 25
      : unusualDays.length <= 1
        ? 18
        : unusualDays.length <= 3
          ? 10
          : 4;
  const hTotal = tScore + bScore + cScore + aScore;
  const hStatus =
    hTotal >= 80
      ? "Healthy"
      : hTotal >= 60
        ? "Good"
        : hTotal >= 40
          ? "Needs Attention"
          : "At Risk";

  // ── Alerts ──
  const alerts = [];
  if (trendPct < -5)
    alerts.push({
      id: "drop",
      severity: "urgent",
      title: `Sales fell ${Math.abs(trendPct)}% in the last period`,
      detail: `Your recent earnings are lower than the period before. Act now to prevent this from continuing.`,
      category: "Sales Trend",
    });
  else if (trendPct > 5)
    alerts.push({
      id: "growth",
      severity: "positive",
      title: `Sales grew ${trendPct}% — great momentum!`,
      detail: `Your recent earnings are higher than the period before. Keep doing what's working.`,
      category: "Sales Trend",
    });
  else
    alerts.push({
      id: "flat",
      severity: "warning",
      title: "Sales are stable but not growing",
      detail:
        "Revenue is flat. Small improvements to your top products or a promotion could shift this upward.",
      category: "Sales Trend",
    });

  if (unusualDays.length > 0)
    alerts.push({
      id: "unusual",
      severity: "urgent",
      title: `${unusualDays.length} unusual day${unusualDays.length > 1 ? "s" : ""} detected`,
      detail: `On ${unusualDays.slice(0, 3).join(", ")} your earnings were very different from normal. Worth investigating.`,
      category: "Unusual Activity",
    });

  if (concPct > 65)
    alerts.push({
      id: "conc",
      severity: "warning",
      title: `${concPct}% of income from just 3 products`,
      detail: `High dependence on a few products is risky. If one has a problem, the whole store suffers.`,
      products: segmented.slice(0, 3).map((p) => p.product),
      category: "Risk",
    });

  const needsReview = segmented.filter((p) => p.segment === "Needs Review");
  if (needsReview.length > 0)
    alerts.push({
      id: "weak",
      severity: "warning",
      title: `${needsReview.length} products are not performing well`,
      detail: `These products have low earnings and few buyers. Consider promoting or removing them.`,
      products: needsReview.slice(0, 5).map((p) => p.product),
      category: "Product Health",
    });

  // Low conversion products
  const lowConv = segmented.filter(
    (p) => p.views > 50 && p.conversion_rate < avgConv * 0.8,
  );
  if (lowConv.length > 0)
    alerts.push({
      id: "conv",
      severity: "warning",
      title: `${lowConv.length} products have visitors but few buyers`,
      detail: `${lowConv[0].product} gets traffic but only ${lowConv[0].conversion_rate}% buy. Better photos, description or a small discount could help.`,
      products: lowConv.slice(0, 4).map((p) => p.product),
      category: "Missed Opportunity",
    });

  // ── Category impacts — must be before quickWins ──
  const catHalf = Math.floor(daily.length / 2);
  const recentSet = new Set(daily.slice(-catHalf).map((d) => d.date));
  const priorSet = new Set(daily.slice(0, catHalf).map((d) => d.date));
  const catRecent = {},
    catPrior = {};
  rows.forEach((r) => {
    const cat = r[categoryCol] || "General";
    const rev = parseFloat(r[revenueCol]) || 0;
    const date = r[dateCol] || "";
    if (recentSet.has(date)) {
      if (!catRecent[cat]) catRecent[cat] = 0;
      catRecent[cat] += rev;
    }
    if (priorSet.has(date)) {
      if (!catPrior[cat]) catPrior[cat] = 0;
      catPrior[cat] += rev;
    }
  });
  const catImpacts = Object.keys(catRecent)
    .map((cat) => {
      const r = catRecent[cat] || 0,
        p = catPrior[cat] || r;
      return {
        category: cat,
        change_pct: p ? +(((r - p) / p) * 100).toFixed(1) : 0,
      };
    })
    .sort((a, b) => a.change_pct - b.change_pct);

  // ── Quick wins — recommendations tied to actual problems, not generic suggestions ──
  const quickWins = [];
  const bestDow = dow.length
    ? dow.reduce((a, b) => (a.avg > b.avg ? a : b))
    : { day: "weekend", avg: 0 };
  const topEarner = segmented.find((p) => p.segment === "Top Earner");
  const growingProds = segmented.filter((p) => p.segment === "Growing");
  const worstCat = catImpacts.length ? catImpacts[0] : null;

  // If declining — first action should be to address the DECLINE, not promote an already top product
  if (trendPct < -5) {
    quickWins.push({
      title: `Run a store-wide sale this ${bestDow.day} to stop the decline`,
      why: `Your sales dropped ${Math.abs(trendPct)}% recently. A targeted promotion on ${bestDow.day} — your strongest day — is the fastest way to reverse this before it compounds further.`,
      expected: `Estimated ${Math.abs(trendPct) > 15 ? "15–25%" : "8–15%"} revenue recovery within 7 days`,
      effort: "Low",
      timing: `This ${bestDow.day}`,
    });
    if (worstCat)
      quickWins.push({
        title: `Investigate why ${worstCat.category} dropped ${Math.abs(worstCat.change_pct)}%`,
        why: `${worstCat.category} fell the most recently. Check if there is a stock issue, a competitor, or a listing problem. Fixing this one category could recover a large portion of the lost revenue.`,
        expected: "Direct recovery in your worst-performing category",
        effort: "Medium",
        timing: "This week",
      });
  } else if (trendPct >= 0) {
    // Growing — recommend scaling what's working, not a random promotion
    if (growingProds.length > 0)
      quickWins.push({
        title: `Scale up advertising on ${growingProds[0].product} — it's gaining momentum`,
        why: `${growingProds[0].product} is in your Growing group with good buying rate and rising potential. Putting more ad spend here while it's trending up gives the best return.`,
        expected: "Compounded growth on an already-rising product",
        effort: "Low",
        timing: `This ${bestDow.day}`,
      });
  }

  // Fix low-converting products — always relevant regardless of trend
  if (lowConv.length > 0)
    quickWins.push({
      title: `Fix the ${lowConv[0].product} listing — ${lowConv[0].views.toLocaleString()} visitors didn't buy`,
      why: `${lowConv[0].views} people visited ${lowConv[0].product} but only ${lowConv[0].conversion_rate}% bought — below your store average. Better photos, clearer description, or a small price drop could convert many of those visitors.`,
      expected: "Even a 1% improvement means significantly more orders",
      effort: "Low",
      timing: "This week",
    });

  // Remove dead weight
  if (needsReview.length > 2)
    quickWins.push({
      title: `Remove or refresh your ${needsReview.length} weakest products`,
      why: `These products have low earnings and few buyers. They take up listing space that your growing products could use. Removing them also improves your store's average metrics.`,
      expected: "Cleaner catalog, better overall store performance",
      effort: "Low",
      timing: "This week",
    });

  // Weekend timing — always relevant
  quickWins.push({
    title: `Increase your ad spend every ${bestDow.day}`,
    why: `${bestDow.day} is already your strongest day, averaging ₹${bestDow.avg}K naturally. Paid promotion on your best day compounds your existing advantage without extra risk.`,
    expected: "10–20% additional revenue on your peak day",
    effort: "Medium",
    timing: "Every week",
  });

  // ── Monthly ──
  const monthMap = {};
  daily.forEach((d) => {
    const m = d.date.slice(0, 7);
    if (!monthMap[m]) monthMap[m] = { month: m, revenue: 0, orders: 0 };
    monthMap[m].revenue += d.revenue;
    monthMap[m].orders += d.orders;
  });
  const monthly = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({
      ...m,
      revenue: +(m.revenue / 1e5).toFixed(1),
      label: m.month.slice(5) + " " + m.month.slice(0, 4),
    }));

  return {
    daily,
    products: segmented,
    categories,
    monthly,
    dow,
    unusualDays,
    unusualSet: new Set(unusualDays),
    totalRev,
    trendPct,
    recentAvg,
    avgBuyRate: +avgBuyRate.toFixed(1),
    concPct,
    bestDay,
    forecast: { base: fcBase, optimistic: fcOpt, pessimistic: fcPess },
    healthScore: {
      total: hTotal,
      status: hStatus,
      components: {
        sales_trend: tScore,
        buying_rate: bScore,
        product_variety: cScore,
        unusual_events: aScore,
      },
      explanation: `Your store scored ${hTotal} out of 100 — ${hStatus}. ${hTotal < 60 ? "There are clear opportunities to improve." : "Keep building on what's working."}`,
    },
    alerts,
    quickWins,
    catImpacts,
    meta: {
      rows: rows.length,
      days: daily.length,
      products: products.length,
      categories: categories.length,
    },
  };
}

const UploadScreen = ({ onData }) => {

  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [pasteText, setPasteText] = useState("");

  const inputRef = useRef(null);

  const processText = useCallback(
    (text, name) => {

      try {

        setStatus("loading");

        setProgress(20);

        const rows = parseCSV(text);

        setProgress(60);

        if (rows.length < 3) {

          throw new Error(
            "Too few rows found in CSV."
          );
        }

        const result = analyseData(rows);

        setProgress(100);

        setTimeout(() => {

          onData(result, name);

        }, 1200);

      } catch (err) {

        setStatus("error");

        setErrorMsg(
          err.message || "Failed to analyse data."
        );
      }
    },

    [onData]
  );

  const processFile = useCallback(
    (file) => {

      if (!file) return;

      if (!file.name.endsWith(".csv")) {

        setErrorMsg(
          "Please upload a valid CSV file."
        );

        setStatus("error");

        return;
      }

      setStatus("loading");

      setProgress(0);

      setErrorMsg("");

      try {

        const reader = new FileReader();

        reader.onload = (e) =>
          processText(e.target.result, file.name);

        reader.onerror = () =>
          setStatus("paste");

        reader.readAsText(file);

      } catch {

        setStatus("paste");
      }
    },

    [processText]
  );

  const onDrop = useCallback(
    (e) => {

      e.preventDefault();

      setDragging(false);

      processFile(
        e.dataTransfer.files[0]
      );
    },

    [processFile]
  );

  const handlePasteSubmit = () => {

    if (!pasteText.trim()) {

      setErrorMsg(
        "Paste your CSV data first."
      );

      return;
    }

    processText(
      pasteText.trim(),
      "pasted_data.csv"
    );
  };

  const loadingMessages = [

    "Generating revenue predictions...",

    "Detecting unusual sales patterns...",

    "Running Isolation Forest analysis...",

    "Clustering product performance...",

    "Building AI business insights...",

    "Optimizing recommendation engine...",
  ];

  const [loadingIndex, setLoadingIndex] =
    useState(0);

  useEffect(() => {

    if (status !== "loading") return;

    const interval = setInterval(() => {

      setLoadingIndex((prev) =>
        (prev + 1) % loadingMessages.length
      );

    }, 1800);

    return () => clearInterval(interval);

  }, [status]);

  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left,#312e81,#0f172a 45%,#020617 100%)",
        overflow: "hidden",
        position: "relative",
        color: "#fff",
        fontFamily:
          "'DM Sans','Segoe UI',sans-serif",
      }}
    >

      {/* Floating gradients */}

      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          background:
            "rgba(99,102,241,0.25)",
          filter: "blur(120px)",
          top: -120,
          left: -120,
          borderRadius: "50%",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          background:
            "rgba(139,92,246,0.18)",
          filter: "blur(120px)",
          bottom: -120,
          right: -100,
          borderRadius: "50%",
        }}
      />
      {[...Array(18)].map((_, i) => (

        <motion.div
          key={i}

          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}

          transition={{
            duration: 4 + i,
            repeat: Infinity,
          }}

          style={{
            position: "absolute",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background:
              "rgba(139,92,246,0.6)",

            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: "blur(1px)",
          }}
        />
      ))}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "grid",
          gridTemplateColumns:
            "1.1fr 1fr",
          minHeight: "100vh",
          alignItems: "center",
          padding: "60px",
          gap: 50,
        }}
      >

        {/* LEFT SIDE */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            duration: 0.8,
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >

            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background:
                  "linear-gradient(135deg,#6366f1,#8b5cf6)",
                boxShadow:
                  "0 0 40px rgba(139,92,246,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 22,
              }}
            >
              E
            </div>

            <div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                Ecomlytics
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "#cbd5e1",
                }}
              >
                AI Powered Business Intelligence
              </div>

            </div>

          </div>

          <div
            style={{
              fontSize: 58,
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: 24,
              letterSpacing: -2,
            }}
          >
            Turn raw store
            <br />
            data into
            <span
              style={{
                background:
                  "linear-gradient(135deg,#818cf8,#c084fc)",
                WebkitBackgroundClip:
                  "text",
                WebkitTextFillColor:
                  "transparent",
              }}
            >
              {" "}
              AI insights
            </span>
          </div>
          <motion.div

            animate={{
              opacity: [0.5, 1, 0.5],
            }}

            transition={{
              repeat: Infinity,
              duration: 2,
            }}

            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background:
                "rgba(16,185,129,0.12)",
              border:
                "1px solid rgba(16,185,129,0.25)",
              color: "#6ee7b7",
              padding: "10px 16px",
              borderRadius: 999,
              marginBottom: 28,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981",
              }}
            />

            AI Systems Online
          </motion.div>
          <div
            style={{
              color: "#cbd5e1",
              fontSize: 17,
              lineHeight: 1.8,
              maxWidth: 620,
              marginBottom: 36,
            }}
          >
            Forecast revenue, detect unusual
            sales behaviour, identify weak
            products, and generate intelligent
            recommendations using machine
            learning.
          </div>

          <div
            style={{
              display: "flex",
              gap: 18,
              flexWrap: "wrap",
            }}
          >

            {[
              "SARIMA Forecasting",
              "Isolation Forest",
              "K-Means Clustering",
              "AI Recommendations",
            ].map((t) => (

              <motion.div
                whileHover={{
                  scale: 1.05,
                }}

                key={t}

                style={{
                  background:
                    "rgba(255,255,255,0.06)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  padding:
                    "12px 18px",
                  borderRadius: 14,
                  backdropFilter:
                    "blur(20px)",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <HiSparkles />
                {t}
              </motion.div>
            ))}
          </div>

        </motion.div>

        {/* RIGHT SIDE */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.92,
          }}

          animate={{
            opacity: 1,
            scale: 1,
          }}

          transition={{
            duration: 0.7,
          }}
        >

          <div
            style={{
              background:
                "rgba(255,255,255,0.06)",
              backdropFilter:
                "blur(30px)",
              border:
                "1px solid rgba(255,255,255,0.08)",
              borderRadius: 30,
              padding: 36,
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.45)",
            }}
          >

            {status === "loading" ? (

              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 28,
                  minHeight: 620,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "50px 30px",
                  background:
                    "radial-gradient(circle at top,#1e293b,#0f172a 70%)",
                }}
              >

                <motion.div
                  animate={{
                    y: [-400, 700],
                  }}

                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "linear",
                  }}

                  style={{
                    position: "absolute",
                    width: "120%",
                    height: 120,
                    background:
                      "linear-gradient(to bottom,transparent,rgba(139,92,246,0.18),transparent)",
                    filter: "blur(8px)",
                  }}
                />

                {[...Array(25)].map((_, i) => (

                  <motion.div
                    key={i}

                    animate={{
                      y: [0, -40, 0],
                      opacity: [0.2, 1, 0.2],
                    }}

                    transition={{
                      duration: 3 + i * 0.2,
                      repeat: Infinity,
                    }}

                    style={{
                      position: "absolute",
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background:
                        "rgba(139,92,246,0.6)",
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      filter: "blur(1px)",
                    }}
                  />
                ))}

                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}

                  transition={{
                    repeat: Infinity,
                    duration: 3,
                  }}

                  style={{
                    width: 260,
                    zIndex: 2,
                    marginBottom: -20,
                  }}
                >
                  <Lottie
                    animationData={aiAnimation}
                    loop={true}
                  />
                </motion.div>

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}

                  animate={{
                    opacity: 1,
                    y: 0,
                  }}

                  style={{
                    fontSize: 34,
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: 14,
                    zIndex: 2,
                    textAlign: "center",
                  }}
                >
                  AI Analysing Store Data
                </motion.div>

                <motion.div
                  key={loadingIndex}

                  initial={{
                    opacity: 0,
                    y: 10,
                  }}

                  animate={{
                    opacity: 1,
                    y: 0,
                  }}

                  transition={{
                    duration: 0.4,
                  }}

                  style={{
                    color: "#a5b4fc",
                    fontSize: 17,
                    marginBottom: 40,
                    zIndex: 2,
                    textAlign: "center",
                    minHeight: 30,
                  }}
                >
                  {loadingMessages[loadingIndex]}
                </motion.div>

                <div
                  style={{
                    width: "100%",
                    maxWidth: 420,
                    zIndex: 2,
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 12,
                      color: "#cbd5e1",
                      fontSize: 13,
                    }}
                  >
                    <span>AI Processing</span>

                    <span>
                      <CountUp end={progress} />
                      %
                    </span>
                  </div>

                  <div
                    style={{
                      background:
                        "rgba(255,255,255,0.08)",
                      height: 14,
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >

                    <motion.div
                      animate={{
                        width: `${progress}%`,
                      }}

                      transition={{
                        duration: 0.4,
                      }}

                      style={{
                        height: "100%",
                        borderRadius: 999,
                        background:
                          "linear-gradient(90deg,#6366f1,#8b5cf6,#c084fc)",
                        boxShadow:
                          "0 0 30px rgba(139,92,246,0.7)",
                      }}
                    />

                  </div>
                </div>

              </div>

            ) : (

              <>

                <Tilt
                  glareEnable={true}
                  glareMaxOpacity={0.12}
                  scale={1.01}
                >

                  <div
                    onDrop={onDrop}

                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}

                    onDragLeave={() =>
                      setDragging(false)
                    }

                    onClick={() =>
                      inputRef.current?.click()
                    }

                    style={{
                      border:
                        dragging
                          ? "2px solid #8b5cf6"
                          : "2px dashed rgba(255,255,255,0.15)",

                      borderRadius: 24,

                      padding:
                        "60px 30px",

                      textAlign:
                        "center",

                      cursor:
                        "pointer",

                      background:
                        dragging
                          ? "rgba(99,102,241,0.12)"
                          : "rgba(255,255,255,0.03)",

                      transition:
                        "all .25s ease",
                    }}
                  >

                    <input
                      ref={inputRef}
                      type="file"
                      accept=".csv"
                      style={{
                        display: "none",
                      }}
                      onChange={(e) =>
                        processFile(
                          e.target.files[0]
                        )
                      }
                    />

                    <motion.div
                      whileHover={{
                        scale: 1.1,
                      }}
                    >
                      <FiUploadCloud
                        size={70}
                        color="#8b5cf6"
                      />
                    </motion.div>

                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        marginTop: 20,
                        marginBottom: 10,
                      }}
                    >
                      Upload Store Data
                    </div>

                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: 15,
                        lineHeight: 1.7,
                        marginBottom: 28,
                      }}
                    >
                      Drag and drop your CSV
                      file or click to browse
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        background:
                          "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        padding:
                          "14px 28px",
                        borderRadius: 14,
                        fontWeight: 700,
                      }}
                    >
                      <FiBarChart2 />
                      Analyse Data
                    </div>

                  </div>

                </Tilt>

                <div
                  style={{
                    marginTop: 28,

                    display: "grid",

                    gridTemplateColumns:
                      window.innerWidth < 700
                        ? "1fr"
                        : window.innerWidth < 1100
                          ? "repeat(2,1fr)"
                          : "repeat(3,1fr)",

                    gap: 18,
                  }}
                >

                  {[
                    {
                      icon: <FiCpu />,
                      title: "ML Forecasting",
                      desc: "SARIMA predictions",
                    },

                    {
                      icon: <FiCheckCircle />,
                      title: "AI Insights",
                      desc: "Anomaly detection",
                    },

                    {
                      icon: <HiSparkles />,
                      title: "Recommendations",
                      desc: "Smart business actions",
                    },
                  ].map((i) => (

                    <Tilt
                      key={i.title}

                      glareEnable={true}
                      glareMaxOpacity={0.18}

                      scale={1.02}

                      tiltMaxAngleX={12}
                      tiltMaxAngleY={12}

                      perspective={1200}
                    >

                      <motion.div
                        whileHover={{
                          y: -6,
                        }}

                        style={{
                          background:
                            "linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))",

                          border:
                            "1px solid rgba(255,255,255,0.08)",

                          borderRadius: 22,

                          padding:
                            window.innerWidth < 700
                              ? "22px 16px"
                              : "26px 18px",

                          textAlign: "center",

                          minHeight:
                            window.innerWidth < 700
                              ? 160
                              : 180,

                          boxShadow:
                            "0 10px 30px rgba(0,0,0,0.25)",

                          backdropFilter: "blur(18px)",

                          position: "relative",

                          overflow: "hidden",

                          display: "flex",

                          flexDirection: "column",

                          justifyContent: "center",
                        }}
                      >

                        <div
                          style={{
                            position: "absolute",
                            inset: 0,

                            background:
                              "radial-gradient(circle at top,rgba(139,92,246,0.16),transparent 60%)",

                            pointerEvents: "none",
                          }}
                        />

                        <motion.div

                          animate={{
                            y: [0, -4, 0],
                          }}

                          transition={{
                            repeat: Infinity,
                            duration: 3,
                          }}

                          style={{
                            fontSize:
                              window.innerWidth < 700
                                ? 28
                                : 34,

                            marginBottom: 14,

                            color: "#8b5cf6",
                          }}
                        >
                          {i.icon}
                        </motion.div>

                        <div
                          style={{
                            fontSize:
                              window.innerWidth < 700
                                ? 20
                                : 16,

                            fontWeight: 700,

                            color: "#fff",

                            marginBottom: 8,

                            lineHeight: 1.3,

                            wordBreak: "break-word",
                          }}
                        >
                          {i.title}
                        </div>

                        <div
                          style={{
                            fontSize:
                              window.innerWidth < 700
                                ? 14
                                : 13,

                            color: "#94a3b8",

                            lineHeight: 1.7,
                          }}
                        >
                          {i.desc}
                        </div>

                      </motion.div>

                    </Tilt>
                  ))}
                </div>

              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
const Tile = ({ label, value, sub, color = "#111827" }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "14px 16px",
      flex: 1,
    }}
  >
    <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 3 }}>
      {label}
    </div>
    <div style={{ fontSize: 21, fontWeight: 700, color }}>{value}</div>
    {sub && (
      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{sub}</div>
    )}
  </div>
);

const SEV_CFG = {
  urgent: {
    bg: "#fef2f2",
    border: "#fca5a5",
    title: "#dc2626",
    dot: "#ef4444",
    badge: "Urgent",
  },
  warning: {
    bg: "#fffbeb",
    border: "#fde68a",
    title: "#d97706",
    dot: "#f59e0b",
    badge: "Review",
  },
  positive: {
    bg: "#f0fdf4",
    border: "#bbf7d0",
    title: "#16a34a",
    dot: "#22c55e",
    badge: "Good",
  },
};
const SEG_CFG = {
  "Top Earner": {
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    desc: "Your biggest money-makers",
  },
  Growing: {
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    desc: "Good potential — invest here",
  },
  "Needs Review": {
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fca5a5",
    desc: "Low sales — refresh or remove",
  },
};

const AlertCard = ({ alert }) => {
  const s = SEV_CFG[alert.severity] || SEV_CFG.warning;
  return (
    <div
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 12,
        padding: "13px 15px",
        marginBottom: 9,
      }}
    >
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: s.dot,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {alert.severity === "urgent"
            ? "!"
            : alert.severity === "positive"
              ? "★"
              : "~"}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 6,
              marginBottom: 3,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: s.title,
                lineHeight: 1.4,
              }}
            >
              {alert.title}
            </div>
            <span
              style={{
                background: s.dot,
                color: "#fff",
                borderRadius: 4,
                padding: "1px 7px",
                fontSize: 10,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {s.badge}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.55 }}>
            {alert.detail}
          </div>
          {alert.products && (
            <div
              style={{
                marginTop: 5,
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
              }}
            >
              {alert.products.slice(0, 4).map((p) => (
                <span
                  key={p}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 4,
                    padding: "1px 6px",
                    fontSize: 10,
                    color: "#374151",
                  }}
                >
                  {p}
                </span>
              ))}
              {alert.products.length > 4 && (
                <span style={{ fontSize: 10, color: "#9ca3af" }}>
                  +{alert.products.length - 4} more
                </span>
              )}
            </div>
          )}
          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>
            {alert.category}
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickWinCard = ({ win, index }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "14px 16px",
      marginBottom: 10,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#6366f1",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        #{index + 1}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: "#111827",
            marginBottom: 4,
          }}
        >
          {win.title}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span
            style={{
              background: "#f3f4f6",
              borderRadius: 4,
              padding: "1px 7px",
              fontSize: 10,
              color: "#374151",
            }}
          >
            ⏱ {win.timing}
          </span>
          <span
            style={{
              background: "#f3f4f6",
              borderRadius: 4,
              padding: "1px 7px",
              fontSize: 10,
              color: "#374151",
            }}
          >
            ⚡ {win.effort} effort
          </span>
        </div>
      </div>
    </div>
    <div
      style={{
        fontSize: 12,
        color: "#6b7280",
        lineHeight: 1.6,
        marginBottom: 7,
      }}
    >
      {win.action || win.why}
    </div>
    <div
      style={{
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: 7,
        padding: "6px 10px",
        fontSize: 12,
        color: "#16a34a",
        fontWeight: 500,
      }}
    >
      💰{win.impact || win.expected}
    </div>
  </div>
);

const HealthRing = ({ score }) => {
  const r = 50,
    circ = 2 * Math.PI * r,
    offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="10"
      />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "60px 60px",
          transition: "stroke-dashoffset 1s ease",
        }}
      />
      <text
        x="60"
        y="54"
        textAnchor="middle"
        fontSize="24"
        fontWeight="700"
        fill={color}
      >
        {score}
      </text>
      <text x="60" y="70" textAnchor="middle" fontSize="11" fill="#6b7280">
        out of 100
      </text>
    </svg>
  );
};

// ─── WHAT-IF PANEL ────────────────────────────────────────────────────────────
const WhatIfPanel = ({ products }) => {
  const [prod, setProd] = useState(products[0]?.product || "");
  const [priceChg, setPriceChg] = useState(0);
  const [disc, setDisc] = useState(0);
  const r = useMemo(() => {
    const p = products.find((x) => x.product === prod);
    if (!p) return null;
    const dc = 1 + (priceChg * -0.8) / 100,
      cb = 1 + disc * 0.05;
    const np = (p.price || 500) * (1 + priceChg / 100) * (1 - disc / 100),
      no = p.orders * dc * cb,
      nr = no * np;
    return {
      origRev: p.revenue,
      origOrders: p.orders,
      newRevenue: nr,
      newOrders: no,
      chgPct: ((nr - p.revenue) / p.revenue) * 100,
    };
  }, [prod, priceChg, disc, products]);
  const pos = r?.chgPct >= 0;
  return (
    <div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 17,
          color: "#111827",
          marginBottom: 3,
        }}
      >
        Test Before You Try
      </div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>
        Move the sliders and instantly see how a price or discount change would
        affect your earnings — before doing it for real.
      </div>
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#374151",
            display: "block",
            marginBottom: 5,
          }}
        >
          Which product?
        </label>
        <select
          value={prod}
          onChange={(e) => setProd(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 13,
            color: "#111827",
            background: "#fff",
          }}
        >
          {products.map((p) => (
            <option key={p.product} value={p.product}>
              {p.product}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#374151",
              display: "block",
              marginBottom: 5,
            }}
          >
            Adjust price: {priceChg > 0 ? "+" : ""}
            {priceChg}%
          </label>
          <input
            type="range"
            min="-30"
            max="30"
            value={priceChg}
            onChange={(e) => setPriceChg(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#6366f1" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: "#9ca3af",
              marginTop: 2,
            }}
          >
            <span>Cheaper</span>
            <span>More expensive</span>
          </div>
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#374151",
              display: "block",
              marginBottom: 5,
            }}
          >
            Discount: {disc}%
          </label>
          <input
            type="range"
            min="0"
            max="40"
            value={disc}
            onChange={(e) => setDisc(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#6366f1" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: "#9ca3af",
              marginTop: 2,
            }}
          >
            <span>None</span>
            <span>40% off</span>
          </div>
        </div>
      </div>
      {r && (
        <div style={{ background: "#f9fafb", borderRadius: 12, padding: 14 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 10,
            }}
          >
            {[
              ["Current earnings", fmt(r.origRev), "#6b7280"],
              [
                "Estimated earnings",
                fmt(r.newRevenue),
                pos ? "#16a34a" : "#dc2626",
              ],
              ["Current orders", r.origOrders.toLocaleString(), "#6b7280"],
              [
                "Estimated orders",
                Math.round(r.newOrders).toLocaleString(),
                "#374151",
              ],
            ].map(([l, v, c]) => (
              <div
                key={l}
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: "9px 12px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: c }}>
                  {v}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              background: pos ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${pos ? "#bbf7d0" : "#fca5a5"}`,
              borderRadius: 8,
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: pos ? "#16a34a" : "#dc2626",
                marginBottom: 3,
              }}
            >
              {pos ? "▲" : "▼"} {Math.abs(r.chgPct).toFixed(1)}% change in
              earnings
            </div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>
              {pos
                ? "This change looks good — estimated earnings go up."
                : "Careful — this could reduce earnings. Try adjusting the sliders."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ASSISTANT ────────────────────────────────────────────────────────────────
const Assistant = ({ data, msgs, setMsgs, loading, setLoading }) => {
  const [input, setInput] = useState("");

  //   const [msgs, setMsgs] = useState([
  //     {
  //       role: "bot",
  //       text: `# Welcome to Ecomlytics AI

  // Ask me anything about your store performance, products, risks, growth opportunities, or sales trends.`,
  //     },
  //   ]);

  // const [loading, setLoading] = useState(false);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [msgs]);

  // ─── SEND ─────────────────────────────────────────────────────────────────
  const send = async (preset) => {
    const q = preset || input.trim();

    if (!q) return;

    setInput("");

    setMsgs((m) => [
      ...m,
      {
        role: "user",
        text: q,
      },
    ]);

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: q,
          storeData: data,
        }),
      });

      const result = await res.json();

      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: result.reply || "I couldn't generate a response right now.",
        },
      ]);
    } catch (err) {
      console.error(err);

      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: "Something went wrong while connecting to the AI server.",
        },
      ]);
    }

    setLoading(false);
  };

  // ─── QUICK QUESTIONS ──────────────────────────────────────────────────────
  const SUGGS = [
    "Why are my sales dropping?",
    "Which products should I focus on?",
    "Is my store at risk?",
    "Create a growth strategy",
    "What products should I discontinue?",
    "How can I improve conversion rate?",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <div
        style={{
          fontWeight: 700,
          fontSize: 17,
          color: "#111827",
          marginBottom: 3,
        }}
      >
        Store Assistant
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
          marginBottom: 12,
        }}
      >
        Ask anything about your store in plain English.
      </div>

      {/* SUGGESTIONS */}
      <div
        style={{
          display: "flex",
          gap: 5,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        {SUGGS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            style={{
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: "4px 11px",
              fontSize: 11,
              color: "#374151",
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* CHAT AREA */}
      <div
        style={{
          overflowY: "auto",
          marginBottom: 10,
          minHeight: 250,
          maxHeight: 420,
          paddingRight: 4,
        }}
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 12,
            }}
          >
            {/* USER MESSAGE */}
            {m.role === "user" ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    background: "#6366f1",
                    color: "#fff",
                    borderRadius: "12px 12px 2px 12px",
                    padding: "10px 14px",
                    fontSize: 13,
                    maxWidth: "80%",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ) : (
              /* BOT MESSAGE */
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: 12,
                  padding: 16,
                  border: "1px solid #e5e7eb",
                  maxWidth: "95%",
                  overflowX: "auto",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "#111827",
                    lineHeight: 1.8,
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            marginBottom: 12,
                            color: "#111827",
                          }}
                        >
                          {children}
                        </h1>
                      ),

                      h2: ({ children }) => (
                        <h2
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            marginTop: 20,
                            marginBottom: 10,
                            color: "#111827",
                          }}
                        >
                          {children}
                        </h2>
                      ),

                      h3: ({ children }) => (
                        <h3
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            marginTop: 16,
                            marginBottom: 8,
                            color: "#111827",
                          }}
                        >
                          {children}
                        </h3>
                      ),

                      p: ({ children }) => (
                        <p
                          style={{
                            marginBottom: 12,
                            color: "#374151",
                          }}
                        >
                          {children}
                        </p>
                      ),

                      li: ({ children }) => (
                        <li
                          style={{
                            marginBottom: 6,
                            color: "#374151",
                          }}
                        >
                          {children}
                        </li>
                      ),

                      strong: ({ children }) => (
                        <strong
                          style={{
                            color: "#111827",
                            fontWeight: 700,
                          }}
                        >
                          {children}
                        </strong>
                      ),

                      code: ({ children }) => (
                        <code
                          style={{
                            background: "#eef2ff",
                            padding: "2px 6px",
                            borderRadius: 6,
                            fontSize: 12,
                            color: "#4338ca",
                          }}
                        >
                          {children}
                        </code>
                      ),

                      table: ({ children }) => (
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginTop: 14,
                            marginBottom: 14,
                          }}
                        >
                          {children}
                        </table>
                      ),

                      th: ({ children }) => (
                        <th
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "8px",
                            background: "#f3f4f6",
                            textAlign: "left",
                          }}
                        >
                          {children}
                        </th>
                      ),

                      td: ({ children }) => (
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* LOADING */}
        {loading && (
          <div
            style={{
              fontSize: 12,
              color: "#9ca3af",
              padding: "10px 14px",
            }}
          >
            Thinking...
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <div
        style={{
          display: "flex",
          gap: 7,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your question here..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 13,
            color: "#111827",
            outline: "none",
          }}
        />

        <button
          onClick={() => send()}
          style={{
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Ask
        </button>
      </div>
    </div>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
const Dashboard = ({ data, fileName, onReset }) => {
  const [tab, setTab] = useState("overview");
  const [aiInsights, setAiInsights] = useState(null);
  const [mlForecast, setMlForecast] = useState(null);
  const [mlAnomalies, setMlAnomalies] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [assistantMsgs, setAssistantMsgs] = useState([
    {
      role: "bot",
      text: `# Welcome to Ecomlytics AI

Ask me anything about your store performance, products, risks, growth opportunities, or sales trends.`,
    },
  ]);

  const [assistantLoading, setAssistantLoading] = useState(false);

  useEffect(() => {

    const generateAIInsights = async () => {

      setAiLoading(true);

      const revenue = data.daily.map(
        d => d.revenue
      );

      try {

        const res = await fetch("http://localhost:5000/analyze", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            storeData: data,
          }),
        });

        const result = await res.json();

        setAiInsights(result);


        const forecastRes = await fetch(
          "http://localhost:5000/forecast",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              revenue,
            }),
          }
        );

        const forecastData =
          await forecastRes.json();

        setMlForecast(forecastData);
        const anomalyRes = await fetch(
          "http://localhost:5000/anomalies",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              revenue,
            }),
          }
        );

        const anomalyData =
          await anomalyRes.json();

        setMlAnomalies(anomalyData);

      } catch (err) {

        console.error(err);

      } finally {

        setAiLoading(false);
      }
    };

    generateAIInsights();

  }, [data]);

  const {
    daily,
    products,
    categories,
    monthly,
    dow,
    // unusualSet,
    totalRev,
    trendPct,
    recentAvg,
    avgBuyRate,
    bestDay,
    forecast,
    healthScore,
    alerts,
    quickWins,
    catImpacts,
    meta,
  } = data;

  const unusualDays = mlAnomalies?.anomalies
    ? mlAnomalies.anomalies.map(
      a => daily[a.index]?.date
    ).filter(Boolean)
    : data.fallbackUnusualDays;

  const unusualSet =
    new Set(unusualDays);

  const lastDate = new Date(daily[daily.length - 1]?.date || Date.now());
  const fcChart = (

    mlForecast?.forecast

      ? mlForecast.forecast

      : forecast.base

  ).slice(0, 14).map((v, i) => {

    const d = new Date(lastDate);

    d.setDate(
      d.getDate() + i + 1
    );

    return {

      date:
        `${d.getMonth() + 1}/${d.getDate()}`,

      predicted:
        Math.round(v / 1000),

      optimistic:

        mlForecast?.upper_bound

          ? Math.max(
            0,
            Math.round(
              mlForecast.upper_bound[i]
              / 1000
            )
          )

          : Math.round(v * 1.15 / 1000),

      pessimistic:

        mlForecast?.lower_bound

          ? Math.max(
            0,
            Math.round(
              mlForecast.lower_bound[i]
              / 1000
            )
          )

          : Math.max(
            0,
            Math.round(v * 0.85 / 1000)
          )
    };
  });
  const chartData = daily.map((d) => ({
    date: d.date.slice(5),
    earnings: Math.round(d.revenue / 1000),
  }));

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "alerts", label: "Alerts" },
    { id: "quickwins", label: "Quick Wins" },
    { id: "whatif", label: "What-If" },
    { id: "assistant", label: "Assistant" },
  ];

  return (
    <div
      style={{
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        background: "#f8f9fb",
        minHeight: "100vh",
        color: "#111827",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: "#6366f1",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            E
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>
              Ecomlytics
            </div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: -1 }}>
              Your Smart Store Advisor
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "5px 13px",
                borderRadius: 6,
                border: "1px solid",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                background: tab === t.id ? "#6366f1" : "transparent",
                color: tab === t.id ? "#fff" : "#6b7280",
                borderColor: tab === t.id ? "#6366f1" : "transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              background: "#f3f4f6",
              borderRadius: 7,
              padding: "4px 10px",
              fontSize: 11,
              color: "#374151",
            }}
          >
            📄 {fileName}
          </div>
          <button
            onClick={onReset}
            style={{
              background: "transparent",
              border: "1px solid #e5e7eb",
              borderRadius: 7,
              padding: "4px 12px",
              fontSize: 11,
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            Upload new file
          </button>
        </div>
      </div>

      <div style={{ padding: "20px", maxWidth: 1100, margin: "0 auto" }}>
        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: 3,
                }}
              >
                Your Store at a Glance
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                {meta.days} days of data · {meta.products} products ·{" "}
                {meta.categories} categories · analysed from {fileName}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <Tile
                label="Total earnings"
                value={fmt(totalRev)}
                sub={`Across all ${meta.days} days`}
              />

              <Tile
                label="Recent trend"
                value={`${trendPct >= 0 ? "+" : ""}${trendPct}%`}
                sub="Latest period vs prior period"
                color={trendPct >= 0 ? "#16a34a" : "#dc2626"}
              />

              <Tile
                label="Buying rate"
                value={`${avgBuyRate}%`}
                sub="Out of 100 visitors, this many buy"
              />

              <Tile
                label="Best day"
                value={bestDay.day}
                sub={`Avg ₹${bestDay.avg}K — highest earning day`}
                color="#6366f1"
              />
            </div>

            {aiInsights && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 18,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 8,
                  }}
                >
                  {aiInsights?.overview?.headline}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: "#4b5563",
                    lineHeight: 1.8,
                    marginBottom: 14,
                  }}
                >
                  {aiInsights?.overview?.summary}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      background: "#f9fafb",
                      borderRadius: 10,
                      padding: 12,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        marginBottom: 4,
                      }}
                    >
                      Projection
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: "#111827",
                        fontWeight: 600,
                        lineHeight: 1.6,
                      }}
                    >
                      {aiInsights?.overview?.projection}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#eef2ff",
                      borderRadius: 10,
                      padding: 12,
                      border: "1px solid #c7d2fe",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6366f1",
                        marginBottom: 4,
                      }}
                    >
                      Top Priority
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: "#312e81",
                        fontWeight: 600,
                        lineHeight: 1.6,
                      }}
                    >
                      {aiInsights?.overview?.priority}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Health + Do nothing */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 18,
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <HealthRing score={healthScore.total} />
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#111827",
                      marginBottom: 5,
                    }}
                  >
                    Store Health Score
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      lineHeight: 1.6,
                      maxWidth: 260,
                      marginBottom: 9,
                    }}
                  >
                    {healthScore.explanation}
                  </div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {[
                      ["Sales trend", healthScore.components.sales_trend],
                      ["Buying rate", healthScore.components.buying_rate],
                      [
                        "Product variety",
                        healthScore.components.product_variety,
                      ],
                      ["Unusual events", healthScore.components.unusual_events],
                    ].map(([l, v]) => (
                      <div
                        key={l}
                        style={{
                          background: "#f3f4f6",
                          borderRadius: 6,
                          padding: "3px 8px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color:
                              v >= 20
                                ? "#16a34a"
                                : v >= 12
                                  ? "#f59e0b"
                                  : "#dc2626",
                          }}
                        >
                          {v}/25
                        </div>
                        <div style={{ fontSize: 10, color: "#9ca3af" }}>
                          {l}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div
                style={{
                  background:
                    trendPct < -5
                      ? "#fef2f2"
                      : trendPct < 0
                        ? "#fff7ed"
                        : "#f0fdf4",
                  border: `1px solid ${trendPct < -5 ? "#fca5a5" : trendPct < 0 ? "#fed7aa" : "#bbf7d0"}`,
                  borderRadius: 14,
                  padding: 18,
                }}
              >
                {trendPct < 0 ? (
                  <>
                    {aiInsights?.strategy && (
                      <div
                        style={{
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: 14,
                          padding: 18,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 16,
                            color: "#111827",
                            marginBottom: 10,
                          }}
                        >
                          AI Strategy Recommendation
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            color: "#4b5563",
                            lineHeight: 1.8,
                            marginBottom: 10,
                          }}
                        >
                          {aiInsights.strategy.recommendation}
                        </div>

                        <div
                          style={{
                            background: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            borderRadius: 10,
                            padding: 12,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              color: "#16a34a",
                              marginBottom: 4,
                            }}
                          >
                            Expected Outcome
                          </div>

                          <div
                            style={{
                              fontSize: 13,
                              color: "#166534",
                              fontWeight: 600,
                            }}
                          >
                            {aiInsights.strategy.expectedOutcome}
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 32,
                          fontWeight: 800,
                          color: trendPct < -5 ? "#dc2626" : "#d97706",
                        }}
                      >
                        {(trendPct * 2).toFixed(1)}%
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: trendPct < -5 ? "#7f1d1d" : "#92400e",
                        }}
                      >
                        projected drop next month
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: trendPct < -5 ? "#7f1d1d" : "#92400e",
                        lineHeight: 1.65,
                        marginBottom: 12,
                      }}
                    >
                      Your sales declined <strong>{Math.abs(trendPct)}%</strong>{" "}
                      in the recent period. If this trend continues without
                      action, next month could drop by roughly{" "}
                      <strong>{Math.abs((trendPct * 2).toFixed(1))}%</strong> —
                      that's approximately{" "}
                      <strong>
                        {fmt(Math.abs(((recentAvg * 30 * trendPct) / 100) * 2))}
                      </strong>{" "}
                      in lost earnings.
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: trendPct < -5 ? "#dc2626" : "#d97706",
                          marginBottom: 2,
                        }}
                      >
                        What to do right now:
                      </div>
                      {quickWins.slice(0, 2).map((w, i) => (
                        <div
                          key={i}
                          style={{
                            background: "#fff",
                            border: `1px solid ${trendPct < -5 ? "#fca5a5" : "#fed7aa"}`,
                            borderRadius: 7,
                            padding: "7px 11px",
                            fontSize: 12,
                            color: "#374151",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: trendPct < -5 ? "#dc2626" : "#d97706",
                            }}
                          >
                            #{i + 1}
                          </span>{" "}
                          {w.title}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#16a34a",
                        marginBottom: 8,
                      }}
                    >
                      📈 Your store is growing — keep it going
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 32,
                          fontWeight: 800,
                          color: "#16a34a",
                        }}
                      >
                        +{(trendPct * 2).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: 13, color: "#166534" }}>
                        projected growth next month
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#166534",
                        lineHeight: 1.65,
                        marginBottom: 12,
                      }}
                    >
                      Sales grew <strong>{trendPct}%</strong> recently. If this
                      holds, next month could be{" "}
                      <strong>{(trendPct * 2).toFixed(1)}% higher</strong> —
                      about{" "}
                      <strong>
                        {fmt(((recentAvg * 30 * trendPct) / 100) * 2)}
                      </strong>{" "}
                      in extra earnings.
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#16a34a",
                          marginBottom: 2,
                        }}
                      >
                        To maintain this momentum:
                      </div>
                      {quickWins.slice(0, 2).map((w, i) => (
                        <div
                          key={i}
                          style={{
                            background: "#fff",
                            border: "1px solid #bbf7d0",
                            borderRadius: 7,
                            padding: "7px 11px",
                            fontSize: 12,
                            color: "#374151",
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "#16a34a" }}>
                            #{i + 1}
                          </span>{" "}
                          {w.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Monthly */}
            {monthly.length > 1 && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 18,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#111827",
                    marginBottom: 10,
                  }}
                >
                  Month-by-month earnings
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {monthly.map((m, i) => {
                    const prev = i > 0 ? monthly[i - 1].revenue : null;
                    const chg = prev
                      ? (((m.revenue - prev) / prev) * 100).toFixed(0)
                      : null;
                    return (
                      <div
                        key={m.month}
                        style={{
                          flex: 1,
                          background: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          padding: "10px 12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            marginBottom: 2,
                          }}
                        >
                          {m.label}
                        </div>
                        <div
                          style={{
                            fontSize: 17,
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          ₹{m.revenue}L
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                          {m.orders.toLocaleString()} orders
                        </div>
                        {chg && (
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: Number(chg) >= 0 ? "#16a34a" : "#dc2626",
                              marginTop: 3,
                            }}
                          >
                            {Number(chg) >= 0 ? "+" : ""}
                            {chg}% vs prev
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Day of week */}
            {dow.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 18,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#111827",
                    marginBottom: 3,
                  }}
                >
                  Which day of the week earns the most?
                </div>
                <div
                  style={{ fontSize: 11, color: "#9ca3af", marginBottom: 10 }}
                >
                  Average daily earnings in ₹ thousands — time your promotions
                  on your strongest day.
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={dow}>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip formatter={(v) => `₹${v}K avg`} />
                    <Bar dataKey="avg" fill="#c7d2fe" radius={[4, 4, 0, 0]}>
                      {dow.map((d, i) => (
                        <rect
                          key={i}
                          fill={d.day === bestDay.day ? "#6366f1" : "#c7d2fe"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div
                  style={{
                    marginTop: 8,
                    background: "#eff6ff",
                    border: "1px solid #c7d2fe",
                    borderRadius: 7,
                    padding: "7px 12px",
                    fontSize: 12,
                    color: "#4338ca",
                  }}
                >
                  💡 <strong>{bestDay.day}</strong> is your strongest day (₹
                  {bestDay.avg}K avg). Schedule all promotions to start on{" "}
                  {bestDay.day}s.
                </div>
              </div>
            )}

            {/* Earnings chart */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 18,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#111827",
                  marginBottom: 2,
                }}
              >
                Daily earnings + 2-week forecast
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 10 }}>
                ₹ thousands · Orange dots = unusual days · Shaded area =
                best/worst case forecast
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={[...chartData.slice(-40), ...fcChart]}
                  margin={{ right: 8 }}
                >
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    interval={5}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v, n) => [
                      `₹${v}K`,
                      n === "earnings"
                        ? "Actual"
                        : n === "predicted"
                          ? "Most likely"
                          : n === "optimistic"
                            ? "Best case"
                            : "Worst case",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="optimistic"
                    fill="#8b5cf6"
                    stroke="none"
                    fillOpacity={0.18}
                  />

                  <Area
                    type="monotone"
                    dataKey="pessimistic"
                    fill="#ef4444"
                    stroke="none"
                    fillOpacity={0.12}
                  />

                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#111827"
                    strokeWidth={3}
                    dot={(p) => {
                      const { cx, cy, payload } = p;

                      const full = daily.find(
                        (d) => d.date.slice(5) === payload.date,
                      );

                      return unusualSet.has(full?.date) ? (
                        <circle
                          key={cx}
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill="#f97316"
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ) : null;
                    }}
                    name="earnings"
                  />

                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#4f46e5"
                    dot={false}
                    strokeWidth={3}
                    strokeDasharray="6 4"
                    name="predicted"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category health */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#111827",
                  marginBottom: 10,
                }}
              >
                How each category is doing
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                  gap: 9,
                }}
              >
                {categories.map((c) => {
                  const imp = catImpacts.find((x) => x.category === c.category);
                  const chg = imp?.change_pct || 0;
                  return (
                    <div
                      key={c.category}
                      style={{
                        background:
                          chg > 5
                            ? "#f0fdf4"
                            : chg < -5
                              ? "#fef2f2"
                              : "#f9fafb",
                        border: `1px solid ${chg > 5 ? "#bbf7d0" : chg < -5 ? "#fca5a5" : "#e5e7eb"}`,
                        borderRadius: 9,
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#111827",
                          marginBottom: 2,
                        }}
                      >
                        {c.category}
                      </div>
                      {imp && (
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color:
                              chg > 5
                                ? "#16a34a"
                                : chg < -5
                                  ? "#dc2626"
                                  : "#f59e0b",
                          }}
                        >
                          {chg > 0 ? "+" : ""}
                          {chg}%
                        </div>
                      )}
                      <div
                        style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}
                      >
                        {fmt(c.revenue)} · {c.buying_rate}% buy rate
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── ALERTS ── */}
        {tab === "alerts" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: 3,
                }}
              >
                What's Happening?
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Everything your store data is signalling right now — sorted by
                what needs attention most.
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#374151",
                    marginBottom: 10,
                  }}
                >
                  Store alerts
                </div>

                {aiLoading ? (
                  <div>Generating AI alerts...</div>
                ) : (
                  aiInsights?.aiAlerts?.map((alert, i) => (
                    <AlertCard
                      key={i}
                      alert={{
                        severity:
                          alert.severity === "high"
                            ? "urgent"
                            : alert.severity === "medium"
                              ? "warning"
                              : "positive",

                        title: alert.title,

                        detail: alert.description,

                        category: "AI Intelligence",
                      }}
                    />
                  ))
                )}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#374151",
                    marginBottom: 10,
                  }}
                >
                  Category breakdown
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 11,
                    padding: 14,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#111827",
                      marginBottom: 9,
                    }}
                  >
                    Latest period vs prior period
                  </div>
                  {catImpacts.map((c) => (
                    <div
                      key={c.category}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#374151" }}>
                        {c.category}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <div
                          style={{
                            width: 65,
                            height: 5,
                            background: "#f3f4f6",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, Math.abs(c.change_pct) * 2.5)}%`,
                              height: "100%",
                              background:
                                c.change_pct >= 0 ? "#22c55e" : "#ef4444",
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: c.change_pct >= 0 ? "#16a34a" : "#dc2626",
                            width: 48,
                            textAlign: "right",
                          }}
                        >
                          {c.change_pct > 0 ? "+" : ""}
                          {c.change_pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 11,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#111827",
                      marginBottom: 9,
                    }}
                  >
                    Your product groups
                  </div>
                  {["Top Earner", "Growing", "Needs Review"].map((seg) => {
                    const prods = products.filter((p) => p.segment === seg);
                    if (!prods.length) return null;
                    const cfg = SEG_CFG[seg];
                    return (
                      <div key={seg} style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            marginBottom: 5,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: cfg.color,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: 12,
                              color: "#111827",
                            }}
                          >
                            {seg}
                          </span>
                          <span style={{ fontSize: 11, color: "#6b7280" }}>
                            — {cfg.desc}
                          </span>
                        </div>
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 3 }}
                        >
                          {prods.slice(0, 6).map((p) => (
                            <span
                              key={p.product}
                              style={{
                                background: cfg.bg,
                                border: `1px solid ${cfg.border}`,
                                borderRadius: 4,
                                padding: "2px 7px",
                                fontSize: 10,
                                color: "#374151",
                              }}
                            >
                              {p.product}
                            </span>
                          ))}
                          {prods.length > 6 && (
                            <span style={{ fontSize: 10, color: "#9ca3af" }}>
                              +{prods.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── QUICK WINS ── */}
        {tab === "quickwins" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: 3,
                }}
              >
                Your Quick Wins
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Specific actions based on your data — with clear expected
                results.
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18,
              }}
            >
              <div>
                {aiInsights?.quickWins?.map((w, i) => (
                  <QuickWinCard key={i} win={w} index={i} />
                ))}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#374151",
                    marginBottom: 10,
                  }}
                >
                  Top 10 products by earnings
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 11,
                    padding: 14,
                  }}
                >
                  {products.slice(0, 10).map((p, i) => {
                    const cfg = SEG_CFG[p.segment] || SEG_CFG["Needs Review"];
                    return (
                      <div
                        key={p.product}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "7px 0",
                          borderBottom: i < 9 ? "1px solid #f3f4f6" : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "#9ca3af",
                              width: 18,
                            }}
                          >
                            #{i + 1}
                          </span>
                          <div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#111827",
                                fontWeight: 500,
                              }}
                            >
                              {p.product}
                            </div>
                            <div style={{ fontSize: 10, color: "#9ca3af" }}>
                              {p.category}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#111827",
                            }}
                          >
                            {fmt(p.revenue)}
                          </div>
                          <span
                            style={{
                              background: cfg.bg,
                              border: `1px solid ${cfg.border}`,
                              borderRadius: 3,
                              padding: "1px 5px",
                              fontSize: 9,
                              color: cfg.color,
                            }}
                          >
                            {p.segment}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── WHAT-IF ── */}
        {tab === "whatif" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: 3,
                }}
              >
                Test Before You Try
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                See how a price change or discount affects earnings — before
                doing it for real.
              </div>
            </div>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 22,
                maxWidth: 600,
              }}
            >
              <WhatIfPanel products={products} />
            </div>
          </div>
        )}

        {/* ── ASSISTANT ── */}
        {tab === "assistant" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: 3,
                }}
              >
                Ask Your Store Anything
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Type a question in plain English and get a specific answer based
                on your actual data.
              </div>
            </div>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 22,
                maxWidth: 700,
              }}
            >
              <Assistant
                data={data}
                msgs={assistantMsgs}
                setMsgs={setAssistantMsgs}
                loading={assistantLoading}
                setLoading={setAssistantLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function Ecomlytics() {
  const [analysedData, setAnalysedData] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleData = useCallback((result, name) => {
    setAnalysedData(result);
    setFileName(name);
  }, []);

  const handleReset = useCallback(() => {
    setAnalysedData(null);
    setFileName("");
  }, []);

  if (!analysedData) return <UploadScreen onData={handleData} />;
  return (
    <Dashboard data={analysedData} fileName={fileName} onReset={handleReset} />
  );
}
