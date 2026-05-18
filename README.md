# Ecomlytics — Your Smart Store Advisor
### A Decision Intelligence Platform for E-commerce Sellers

---

## What is this project?

Ecomlytics analyses your store's sales data and tells you:
- **What is happening** — daily earnings, trends, unusual days
- **Why it is happening** — which category or product caused a change
- **What to do** — specific actions ranked by priority
- **What happens if you do nothing** — future revenue projection

---

## Project Structure

```
ecomlytics-project/
│
├── frontend/                   ← React app (what you see in the browser)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js
│   │   └── App.jsx             ← Main app file
│   └── package.json
│
├── backend/                    ← Python scripts (data + ML)
│   ├── data_generator.py       ← Creates 90 days of sales data
│   ├── ml_engine.py            ← Runs all 3 ML models
│   ├── insight_engine.py       ← Generates insights, recommendations, score
│   ├── run_backend.py          ← Runs all 3 scripts in one go
│   └── requirements.txt
│
├── data/                       ← Generated output files (pre-generated)
│   ├── dataset.json
│   ├── ml_results.json
│   └── engine_results.json
│
└── README.md                   ← This file
```

---

## How to Run — Step by Step

### What you need installed first
- **Node.js** (version 16 or above) — download from https://nodejs.org
- **Python** (version 3.8 or above) — download from https://python.org

To check if they are installed, open your terminal and type:
```
node --version
python --version
```
If both show a version number, you are ready.

---

### Step 1 — Download and unzip the project

1. Download the `ecomlytics-project.zip` file
2. Right-click → Extract All (Windows) or double-click (Mac)
3. You will get a folder called `ecomlytics-project`

---

### Step 2 — Open your terminal

**Windows:**
- Press `Windows key + R`, type `cmd`, press Enter
- Or search for "Command Prompt" in the Start menu

**Mac:**
- Press `Command + Space`, type `Terminal`, press Enter

---

### Step 3 — Go into the project folder

In your terminal, type:

```bash
cd path/to/ecomlytics-project
```

For example, if you extracted it to your Desktop:

**Windows:**
```
cd C:\Users\YourName\Desktop\ecomlytics-project
```

**Mac:**
```
cd ~/Desktop/ecomlytics-project
```

---

### Step 4 — Run the backend (optional — data is pre-generated)

> **Note:** The `data/` folder already has all the generated files.
> You only need to run this if you want to regenerate fresh data.

```bash
cd backend
python run_backend.py
cd ..
```

You will see:
```
==================================================
  Ecomlytics Backend Setup
==================================================

Generating dataset...
  Done: Generated 2700 records, 90 days, 30 products

Running ML models...
  Done: ML results saved to ml_results.json

Running insight engine...
  Done: Insight engine results saved to engine_results.json

==================================================
  All backend steps complete!
==================================================
```

---

### Step 5 — Set up the frontend

```bash
cd frontend
npm install
```

This will download all the required packages. It may take 1–3 minutes.
You will see a lot of text scrolling — that is normal.

---

### Step 6 — Start the app

```bash
npm start
```

After a few seconds you will see:
```
Compiled successfully!

You can now view ecomlytics in the browser.

  Local: http://localhost:3000
```

Your browser will automatically open at **http://localhost:3000**

---

### Step 7 — Use the app

The app has 6 tabs:

| Tab | What it shows |
|---|---|
| **Overview** | Store health score, monthly trend, best day, earnings chart |
| **Alerts** | What's going wrong and why |
| **Quick Wins** | 5 specific actions with expected results |
| **What-If** | Test price/discount changes before making them real |
| **How It Works** | How the system analyses your data |
| **Assistant** | Ask questions in plain English |

---

### To stop the app

Go to your terminal and press `Ctrl + C`

### To start it again later

```bash
cd frontend
npm start
```

---

## Common Problems

**"node is not recognized"**
→ Node.js is not installed. Download it from https://nodejs.org and install it, then try again.

**"python is not recognized"**
→ Python is not installed. Download it from https://python.org and install it, then try again.
→ On some systems use `python3` instead of `python`

**"npm install fails"**
→ Make sure you are inside the `frontend/` folder when you run it
→ Try: `npm install --legacy-peer-deps`

**Browser doesn't open automatically**
→ Manually open your browser and go to http://localhost:3000

**Port 3000 already in use**
→ The terminal will ask you to use a different port — press Y and Enter

---

## ML Models Used (for reference)

| Model | Purpose | Result |
|---|---|---|
| Pattern-based forecasting | Predict next 30 days of revenue | Selected over straight-line method |
| Smart anomaly detection | Find unusual sales days | 5 unusual days found |
| Statistical check | Cross-check anomalies | 3 days flagged, 60% agreement |
| Product grouping | Sort products into performance buckets | Top Earner / Growing / Needs Review |

---

## Key Findings from the Data

- Total 90-day revenue: **₹13.6 Crore**
- Website outage (Mar 23–25) cost: **₹41.6L in lost revenue**
- Best day of the week: **Saturday (71% more than Friday)**
- Real underlying sales drop (excluding spike + outage): **only −3%**
- Store health score: **52/100 — Needs Attention**
- Biggest opportunity: **22,500 people visited Blender but didn't buy**

---

Built as a Final Year Engineering Project
*Ecomlytics — Decision Intelligence for E-commerce Sellers*
# Ecomlytics--Smart-Store-Advisor
