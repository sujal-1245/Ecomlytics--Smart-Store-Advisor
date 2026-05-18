import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import forecastRoutes from "./forecastRoutes.js";
import mlDiagnosticsRoutes from "./mlDiagnosticsRoutes.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "10mb",
  })
);



app.use("/forecast", forecastRoutes);

const client = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// ─────────────────────────────────────────────────────────────
// BUILD BUSINESS CONTEXT
// ─────────────────────────────────────────────────────────────
const buildBusinessContext = (storeData) => {
  return {
    healthScore: storeData.healthScore,

    trendPct: storeData.trendPct,

    totalRevenue: storeData.totalRev,

    avgBuyRate: storeData.avgBuyRate,

    bestDay: storeData.bestDay,

    meta: storeData.meta,

    categoryPerformance: storeData.categories?.map((c) => ({
      category: c.category,
      revenue: c.revenue,
      buying_rate: c.buying_rate,
    })),

    topProducts: storeData.products
      ?.slice(0, 8)
      .map((p) => ({
        product: p.product,
        revenue: p.revenue,
        segment: p.segment,
        conversion_rate: p.conversion_rate,
      })),

    weakProducts: storeData.products
      ?.filter((p) => p.segment === "Needs Review")
      .slice(0, 8)
      .map((p) => ({
        product: p.product,
        revenue: p.revenue,
        conversion_rate: p.conversion_rate,
      })),

    alerts: storeData.alerts?.slice(0, 8),

    quickWins: storeData.quickWins?.slice(0, 8),
  };
};

// ─────────────────────────────────────────────────────────────
// AI CHAT ENDPOINT
// ─────────────────────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  try {
    const { message, storeData } = req.body;

    if (!message || !storeData) {
      return res.status(400).json({
        error: "Missing message or store data",
      });
    }

    const businessContext =
      buildBusinessContext(storeData);

    const compactContext = {

      healthScore:
        businessContext.healthScore,

      trendPct:
        businessContext.trendPct,

      totalRevenue:
        businessContext.totalRevenue,

      avgBuyRate:
        businessContext.avgBuyRate,

      bestDay:
        businessContext.bestDay,

      topProducts:
        businessContext.topProducts
          ?.slice(0, 5),

      weakProducts:
        businessContext.weakProducts
          ?.slice(0, 3),

      alerts:
        businessContext.alerts
          ?.slice(0, 3),

      quickWins:
        businessContext.quickWins
          ?.slice(0, 3),
    };

    const completion =
      await client.chat.completions.create({
        // model: "openai/gpt-oss-120b",

        model: "llama-3.3-70b-versatile",

        temperature: 0.1,

        max_tokens: 900,

        
        messages: [
          {
            role: "system",

            content: `
  You are Ecomlytics AI.

  You are a senior ecommerce business intelligence advisor.

  Your responsibilities:
  - analyze business performance
  - identify risks
  - explain trends
  - recommend growth actions
  - improve conversion
  - help with strategic decisions

  RULES:
  - Be practical, direct, and concise.
  - Keep responses under 120 words unless the user explicitly asks for detail.
  - Prefer bullet points over paragraphs.
  - Give maximum 3 recommendations.
  - Use numbers only when important.
  - Avoid generic advice.
  - Focus on actionable business outcomes.
  - Match the depth of the user's question.
  - For greetings or simple questions, reply briefly.
  - Think like a senior ecommerce consultant.
  - Never reveal chain-of-thought reasoning.
  - Never output <think> tags.
  - Never explain your internal thinking process.
  - Only provide the final answer.


  FORMAT RULES:
  - Use proper markdown.
  - Use REAL markdown tables.
  - Use headings and bullet points.
  - Keep responses visually clean.
  - Prefer short sections over long paragraphs.

  STORE ANALYTICS:
  ${JSON.stringify(businessContext)}
              `,
          },

          {
            role: "user",
            content: message,
          },
        ],
      });

    res.json({
      reply:
        completion.choices[0].message.content,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// AI DASHBOARD INTELLIGENCE
// ─────────────────────────────────────────────────────────────
app.post("/analyze", async (req, res) => {
  try {
    const { storeData } = req.body;

    if (!storeData) {
      return res.status(400).json({
        error: "Missing store data",
      });
    }

    const businessContext =
      buildBusinessContext(storeData);

    const completion =
      await client.chat.completions.create({
        // model: "openai/gpt-oss-120b",
        model: "llama-3.3-70b-versatile",

        temperature: 0.2,



        max_tokens: 900,
        response_format: {
          type: "json_object"
        },

        messages: [
          {
            role: "system",

            content: `
  You are an ecommerce business intelligence engine.

  Analyze the store analytics and return STRICT JSON.
  DO NOT write long paragraphs.
  Keep every field under 20 words.
  Maximum:
  - 3 risks
  - 3 opportunities
  - 3 quickWins
  - 3 aiAlerts

  Return compact JSON only.

  DO NOT return markdown.
  DO NOT return explanations outside JSON.

  Return this structure EXACTLY:

  {
    "overview": {
      "headline": "",
      "summary": "",
      "projection": "",
      "priority": ""
    },

    "risks": [
      {
        "title": "",
        "severity": "high|medium|low",
        "explanation": "",
        "impact": ""
      }
    ],

    "opportunities": [
      {
        "title": "",
        "potential": "",
        "action": ""
      }
    ],

    "quickWins": [
      {
        "title": "",
        "impact": "",
        "action": ""
      }
    ],

    "aiAlerts": [
      {
        "title": "",
        "description": "",
        "severity": "high|medium|low"
      }
    ],

    "strategy": {
      "focus": "",
      "recommendation": "",
      "expectedOutcome": ""
    }
  }

  Use the actual analytics data.

  STORE DATA:
${JSON.stringify({
              healthScore: businessContext.healthScore,
              trendPct: businessContext.trendPct,
              totalRevenue: businessContext.totalRevenue,
              avgBuyRate: businessContext.avgBuyRate,
              bestDay: businessContext.bestDay,
              topProducts: businessContext.topProducts?.slice(0, 5),
              weakProducts: businessContext.weakProducts?.slice(0, 3),
              alerts: businessContext.alerts?.slice(0, 3)
            })}
              `,
          },
        ],
      });

    let raw =
      completion.choices[0].message.content;

    console.log("\n========== FINISH REASON ==========\n");

    console.log(
      completion.choices[0].finish_reason
    );

    console.log("\n===================================\n");

    console.log(
      "RAW LENGTH:",
      raw.length
    );

    console.log("\n========== RAW AI RESPONSE ==========\n");

    console.log(raw);

    console.log("\n=====================================\n");

    raw = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {

      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");

      if (start === -1 || end === -1) {

        console.error(
          "\nJSON STRUCTURE INCOMPLETE\n"
        );

        throw new Error(
          "Incomplete JSON response"
        );
      }

      const cleanJson =
        raw.slice(start, end + 1);

      const parsed =
        JSON.parse(cleanJson);

      res.json(parsed);

    } catch (parseError) {

      console.error(
        "JSON PARSE FAILED:"
      );

      console.error(raw);

      // FALLBACK RESPONSE
      res.json({

        overview: {
          headline:
            "Store performance needs attention",

          summary:
            "Recent trends indicate slowing growth in some categories.",

          projection:
            "Revenue may decline if current trends continue.",

          priority:
            "Focus on improving conversion rate and top-selling categories."
        },

        risks: [
          {
            title:
              "Revenue slowdown",

            severity:
              "high",

            explanation:
              "Recent sales trends show declining momentum.",

            impact:
              "Potential monthly revenue drop."
          }
        ],

        opportunities: [
          {
            title:
              "Boost Electronics",

            potential:
              "High growth potential",

            action:
              "Increase marketing for top electronics products."
          }
        ],

        quickWins: [
          {
            title:
              "Weekend Promotion",

            impact:
              "Increase short-term revenue",

            action:
              "Run targeted weekend discount campaigns."
          }
        ],

        aiAlerts: [
          {
            title:
              "Home & Kitchen decline",

            description:
              "This category dropped significantly in recent periods.",

            severity:
              "high"
          }
        ],

        strategy: {
          focus:
            "Retention and conversion",

          recommendation:
            "Invest in high-performing products and improve user engagement.",

          expectedOutcome:
            "Stabilized revenue and improved conversion."
        }
      });
    }

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "AI analysis failed",
    });
  }
});

// ─────────────────────────────────────────────────────────────

app.listen(5000, () => {
  console.log(
    "Ecomlytics AI Server running on port 5000"
  );
});
