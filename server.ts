import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy-loaded Gemini Client
  let aiClient: GoogleGenAI | null = null;
  function getAIClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required.");
      }
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Helper function to calculate clean offline budget & trends fallbacks
  function getOfflineTrends(accounts: any, bills: any, transactions: any, scenario: string) {
    const totalChecking = accounts?.find((a: any) => a.type === 'checking')?.balance || 1558.03;
    const totalSavings = accounts?.find((a: any) => a.type === 'savings')?.balance || 955.00;
    const totalDebt = Math.abs(accounts?.find((a: any) => a.type === 'credit')?.balance || 43348.88);
    const unpaidBills = bills?.filter((b: any) => !b.isPaid) || [];
    const totalUnpaidBills = unpaidBills.reduce((sum: number, b: any) => sum + b.amount, 0);
    const safeToSpend = totalChecking - totalUnpaidBills;

    let planTitle = "General Financial Wellness Strategy";
    let planSteps = [
      { title: "Secure Upcoming Bills First", desc: `Ensure $${totalUnpaidBills.toFixed(2)} is allocated for upcoming bills (like Swoosh and ACCM) before checking discretionary budgets.` },
      { title: "Reduce Discretionary Spending", desc: "Your Woolworths groceries ($112.50) and transport represent the majority of this cycle's spend. Cook at home to save." },
      { title: "Tackle Interest Drag", desc: `Direct 70% of residual cashflow to reduce your Credit Card debt ($${totalDebt.toLocaleString()}) to avoid high interest compounding.` }
    ];

    if (scenario === 'savings_boost') {
      planTitle = "⚡ Hyper-Speed Savings Optimizer";
      planSteps = [
        { title: "Activate No-Spend Mode", desc: "Enabling No-Spend Mode locks down non-essential spends, saving an estimated $45.00 on coffees/rides this week." },
        { title: "The $10 Grocery Challenge", desc: "Plan weekly meals strictly around supermarket sales. Aim to shave 10% off your next Woolworths shop." },
        { title: "Auto-Transfer Residual Cashflow", desc: `Instantly route $20.00 right after each payday into your Emergency Fund ($${totalSavings.toFixed(2)}) to build momentum.` }
      ];
    } else if (scenario === 'sub_cleanup') {
      planTitle = "🔍 Subscription & Bill Audit";
      planSteps = [
        { title: "Consolidate Entertainment", desc: "You have Disney+ ($17.99) active. If you have other active subscriptions, rotate them month-to-month to save $215/year." },
        { title: "Negotiate Swoosh Utilities", desc: "Swoosh is charging $66.53/weekly. Call them to audit your plan or shop for energy/utility discounts." },
        { title: "Review SPER Payment Plans", desc: "Your SPER plan is $36.05/weekly. Check if a lower installment plan can free up immediate cashflow." }
      ];
    } else if (scenario === 'debt_triage') {
      planTitle = "🛡️ Debt Paydown Blueprint";
      planSteps = [
        { title: "Target the Credit Card Debt", desc: `With $${totalDebt.toLocaleString()} in Credit Card Debt, every day accrues high interest. Prioritize this over additional savings.` },
        { title: "Avalanche Method Application", desc: `Pay minimum on other lines, and sweep 100% of your safe-to-spend surplus ($${safeToSpend.toFixed(2)}) into the credit card.` },
        { title: "Lock the Card", desc: `Temporarily freeze credit card transactions. Only use checking balance ($${totalChecking.toFixed(2)}) for essentials.` }
      ];
    }

    return {
      rating: "Stable",
      score: 74,
      projectedSavings: totalSavings + (safeToSpend * 0.15),
      trendsSummary: "Your discretionary transactions are moderate, but high credit liabilities require strategic cashflow routing.",
      topCategories: [
        { category: "Groceries", amount: 112.50, percentage: 43, status: "normal" },
        { category: "Transport & Rides", amount: 92.00, percentage: 35, status: "high" },
        { category: "Health & Gym", amount: 50.00, percentage: 19, status: "normal" },
        { category: "Other Drinks", amount: 8.50, percentage: 3, status: "normal" }
      ],
      leaks: [
        { merchant: "Woolworths", amount: 112.50, frequency: "Weekly", action: "Generic brand substitutions can save $22.50 per shop." },
        { merchant: "Uber Ride & Gas", amount: 92.00, frequency: "Weekly", action: "Combine trips or walk short routes to save up to $30.00." },
        { merchant: "Disney+", amount: 17.99, frequency: "Monthly", action: "Redundant? Pause for 30 days to check if you actually miss it." }
      ],
      scenarioPlan: {
        title: planTitle,
        steps: planSteps
      },
      offline: true
    };
  }

  // API Route: Personal Finance AI Budget & Spending Trends Analyzer
  app.post("/api/gemini/trends", async (req, res) => {
    try {
      const { accounts, bills, transactions, scenario = "general" } = req.body || {};

      if (!process.env.GEMINI_API_KEY) {
        return res.json(getOfflineTrends(accounts, bills, transactions, scenario));
      }

      // Call Gemini using gemini-2.5-flash!
      const prompt = `Analyze this real-time financial snapshot and generate a professional, deep, encouraging personal finance budgeting and spending trends report.
Determine trends, find spending leaks, score their safety rating, and generate a step-by-step action plan tailored specifically to the requested scenario.

ACCOUNTS: ${JSON.stringify(accounts || [])}
BILLS: ${JSON.stringify(bills || [])}
TRANSACTIONS: ${JSON.stringify(transactions || [])}
REQUESTED SCENARIO: ${scenario}

Scenario Guidance:
- general: Provide overall cashflow and wellness advice.
- savings_boost: Focus heavily on finding immediate savings and accelerating emergency fund growth.
- sub_cleanup: Focus on auditing bills, subscription redundancies, and utility negotiations.
- debt_triage: Focus on managing, structuring, and aggressively paying down liabilities (like the credit card debt).`;

      const response = await getAIClient().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are the Evergrove AI Financial Analyst, an expert personal finance strategist. You always output a clean, valid JSON object matching this schema:
{
  "rating": "Optimal" | "Stable" | "Warning",
  "score": number (0 to 100),
  "projectedSavings": number (estimated end of cycle total savings balance),
  "trendsSummary": "1-2 sentence overall summary of spending trends and discretionary flow",
  "topCategories": [
    { "category": "string", "amount": number, "percentage": number, "status": "high" | "normal" | "low" }
  ],
  "leaks": [
    { "merchant": "string", "amount": number, "frequency": "string", "action": "string (actionable savings advice)" }
  ],
  "scenarioPlan": {
    "title": "string (Action Plan Title)",
    "steps": [
      { "title": "string (Action title)", "desc": "string (Detailed actionable steps referencing their actual bills or accounts)" }
    ]
  }
}
Avoid empty generic arrays. Fill them with actual findings from the user's data. Always make sure to reference real merchants, bill names (like Disney+, Swoosh, ACCM, SPER), and amounts from the input data.`,
          responseMimeType: "application/json",
        },
      });

      const resultText = response.text || "{}";
      const result = JSON.parse(resultText.trim());
      res.json(result);
    } catch (err: any) {
      console.error("Gemini Trends API Error:", err);
      // Fallback gracefully instead of throwing 500 error
      const { accounts, bills, transactions, scenario = "general" } = req.body || {};
      res.json(getOfflineTrends(accounts, bills, transactions, scenario));
    }
  });

  // API Route: AI Insights & Quick Cashflow Tips
  app.post("/api/gemini/insight", async (req, res) => {
    try {
      const { accounts, bills, transactions, noSpendMode, daysRemaining } = req.body || {};
      const checkingAcc = accounts?.find((a: any) => a.type === 'checking');
      const activeBalance = checkingAcc ? checkingAcc.balance : 0;
      const unpaidBills = bills?.filter((b: any) => !b.isPaid) || [];
      const totalUnpaidBills = unpaidBills.reduce((sum: number, b: any) => sum + b.amount, 0);
      const safeToSpend = Math.max(0, activeBalance - totalUnpaidBills);
      const remainingDays = daysRemaining || 4;
      const baselineLimit = (safeToSpend / remainingDays);

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          insight: "🔑 Ready for AI? Add your GEMINI_API_KEY in Settings > Secrets to unlock personalized cashflow tips!",
          tag: "Setup AI",
          safeDailyLimit: Number(baselineLimit.toFixed(2)),
          safeDailyLimitExplanation: `Calculated as checking balance minus $${totalUnpaidBills.toFixed(2)} unpaid bills over ${remainingDays} days remaining.`
        });
      }

      const prompt = `Analyze this real-time financial snapshot and generate:
1. A single, highly actionable, encouraging personal finance cashflow tip (max 2 short sentences) prefixed with a relevant emoji.
2. A 1-2 word "category tag" (e.g., "Subscription Savings", "Net Income Boost", "Debt Triage", "Cashflow Guard").
3. A dynamic safe spending limit per day ("safeDailyLimit") as a number, taking into account any potential savings buffer, subscription renewals, or active "no spend" mode.
4. A short explanation ("safeDailyLimitExplanation") of why you recommended this specific daily spend rate (max 1 sentence).

ACCOUNTS: ${JSON.stringify(accounts || [])}
BILLS: ${JSON.stringify(bills || [])}
TRANSACTIONS: ${JSON.stringify(transactions || [])}
NO-SPEND MODE: ${noSpendMode ? "ACTIVE" : "INACTIVE"}
DAYS REMAINING UNTIL PAYDAY: ${remainingDays}
BASELINE SAFE-TO-SPEND AMOUNT (Checking - Unpaid Bills): $${safeToSpend.toFixed(2)} (Baseline Daily Rate: $${baselineLimit.toFixed(2)})`;

      const response = await getAIClient().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an expert, encouraging iOS personal finance AI. You always output a clean JSON object containing:
{
  "insight": "Emoji + 1-2 sentence hyper-personalized actionable finance insight based on their data",
  "tag": "1-2 word category tag for a small iOS pill badge",
  "safeDailyLimit": number (recommendation for daily spend),
  "safeDailyLimitExplanation": "Short 1-sentence reason referencing upcoming bills or current cashflow state"
}`,
          responseMimeType: "application/json",
        },
      });

      const resultText = response.text || "{}";
      const result = JSON.parse(resultText.trim());
      res.json(result);
    } catch (err: any) {
      console.error("Gemini API Insight Error:", err);
      // Construct a smart, dynamic offline message based on actual data
      const { accounts, bills, transactions, noSpendMode, daysRemaining } = req.body || {};
      const checkingAcc = accounts?.find((a: any) => a.type === 'checking');
      const activeBalance = checkingAcc ? checkingAcc.balance : 0;
      const unpaidBills = bills?.filter((b: any) => !b.isPaid) || [];
      const totalUnpaidBills = unpaidBills.reduce((sum: number, b: any) => sum + b.amount, 0);
      const safeToSpend = Math.max(0, activeBalance - totalUnpaidBills);
      const remainingDays = daysRemaining || 4;
      const baselineLimit = safeToSpend / remainingDays;

      // Select dynamic tag
      let tag = "Local Mode";
      let insight = `💡 Evergrove is in high-efficiency Local Mode. Your custom daily budget is calculated around $${totalUnpaidBills.toFixed(2)} upcoming bills.`;
      if (noSpendMode) {
        tag = "No-Spend Active";
        insight = `🌱 No-Spend Boost: Aim to restrict non-essentials to maximize your remaining $${safeToSpend.toFixed(2)} buffer until payday.`;
      } else if (totalUnpaidBills > activeBalance) {
        tag = "Cashflow Alert";
        insight = `⚠️ Alert: Outstanding bills of $${totalUnpaidBills.toFixed(2)} exceed your checking balance. Try checking the Debt Triage tips!`;
      }

      res.json({
        insight,
        tag,
        safeDailyLimit: Number(baselineLimit.toFixed(2)),
        safeDailyLimitExplanation: `Dynamic offline calculations: checking minus $${totalUnpaidBills.toFixed(2)} unpaid bills over ${remainingDays} days remaining.`
      });
    }
  });

  // Helper to build redirect URI for GitHub OAuth App
  function getRedirectUri(req: any) {
    if (process.env.APP_URL) {
      return `${process.env.APP_URL.replace(/\/$/, "")}/api/github/callback`;
    }
    const host = req.get("host") || "localhost:3000";
    const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    return `${protocol}://${host}/api/github/callback`;
  }

  // API Route: GitHub OAuth authorize URL
  app.get("/api/github/auth/url", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID || "Iv23li8e8fb4340d87a7"; // Fallback Client ID for seamless testing
    const redirectUri = getRedirectUri(req);
    const state = Math.random().toString(36).substring(7);
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user&state=${state}`;
    res.json({ url: authUrl });
  });

  // API Route: GitHub OAuth Callback receiver
  app.get("/api/github/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID || "Iv23li8e8fb4340d87a7";
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || "";

    try {
      if (!code) {
        throw new Error("No authorization code provided from GitHub.");
      }

      // Exchange code for Access Token
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code
        })
      });

      const tokenData: any = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        throw new Error(tokenData.error_description || "Failed to exchange authorization code for access token.");
      }

      // Fetch user profile to get their username
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "aistudio-build"
        }
      });

      const userData: any = await userResponse.json();
      const username = userData.login || "";

      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>GitHub Authorized</title>
            <style>
              body {
                background: #0e121d;
                color: #cbd5e1;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                text-align: center;
                padding: 40px 20px;
              }
              h2 { color: #0db095; }
              .spinner {
                border: 3px solid rgba(13, 176, 149, 0.1);
                border-top: 3px solid #0db095;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                animation: spin 1s linear infinite;
                 margin: 20px auto;
              }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <h2>⚡ Connection Established!</h2>
            <p>Successfully connected to GitHub account: <strong>${username}</strong></p>
            <div class="spinner"></div>
            <p style="font-size: 12px; color: #64748b;">This window will close automatically...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_AUTH_SUCCESS',
                  provider: 'github',
                  token: '${accessToken}',
                  username: '${username}'
                }, '*');
                setTimeout(() => { window.close(); }, 1200);
               } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("GitHub callback exchange error:", err);
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>GitHub Connection Failed</title>
            <style>
              body {
                background: #0e121d;
                color: #cbd5e1;
                font-family: -apple-system, sans-serif;
                text-align: center;
                padding: 40px 20px;
               }
               h2 { color: #f43f5e; }
               .btn {
                 background: #1e2638;
                 color: #cbd5e1;
                 padding: 8px 16px;
                 border: 1px solid #334155;
                 border-radius: 8px;
                 cursor: pointer;
                 text-decoration: none;
               }
            </style>
          </head>
          <body>
            <h2>❌ Connection Failed</h2>
            <p>${err.message || "An unknown error occurred during GitHub authorization."}</p>
            <br/>
            <button class="btn" onclick="window.close()">Close Window</button>
          </body>
        </html>
      `);
    }
  });

  // API Route: GitHub Live Commit Counting (Daily Productivity)
  app.post("/api/github/commits", async (req, res) => {
    const { token, username } = req.body;
    if (!token || !username) {
      return res.json({ commitCount: 0, reason: "Missing token or username" });
    }

    try {
      const response = await fetch(`https://api.github.com/users/${username}/events`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "aistudio-build"
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API returned status ${response.status}`);
      }

      const events: any = await response.json();
      if (!Array.isArray(events)) {
        return res.json({ commitCount: 0 });
      }

      const todayStr = new Date().toISOString().split("T")[0];
      let commitCount = 0;

      for (const event of events) {
        if (event.type === "PushEvent" && event.created_at && event.created_at.startsWith(todayStr)) {
          const commits = event.payload?.commits;
          if (Array.isArray(commits)) {
            commitCount += commits.length;
          }
        }
      }

      res.json({ commitCount });
    } catch (err: any) {
      console.error("Error fetching commits:", err);
      res.json({ commitCount: 0, error: err.message });
    }
  });

  // API Route: Backup cashflow ledger to specific GitHub Repository
  app.post("/api/github/backup", async (req, res) => {
    const { token, username, repo, payload } = req.body;
    if (!token || !username || !repo || !payload) {
      return res.status(400).json({ success: false, error: "Missing required fields: token, username, repo, payload" });
    }

    const cleanRepo = repo.includes("/") ? repo : `${username}/${repo}`;
    const filePath = "evergrove-ledger.json";
    const url = `https://api.github.com/repos/${cleanRepo}/contents/${filePath}`;

    try {
      let existingSha: string | null = null;
      const getFileResponse = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "aistudio-build"
        }
      });

      if (getFileResponse.ok) {
        const fileData: any = await getFileResponse.json();
        existingSha = fileData.sha;
      }

      const contentBase64 = Buffer.from(JSON.stringify(payload, null, 2)).toString("base64");

      const putResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "aistudio-build"
        },
        body: JSON.stringify({
          message: `chore: automatic ledger backup via Evergrove [skip ci]`,
          content: contentBase64,
          sha: existingSha || undefined
        })
      });

      if (!putResponse.ok) {
        const errBody = await putResponse.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errBody.message || `Failed with status ${putResponse.status}`);
      }

      const resultData: any = await putResponse.json();
      res.json({
        success: true,
        sha: resultData.content?.sha,
        html_url: resultData.content?.html_url,
        commit_sha: resultData.commit?.sha
      });
    } catch (err: any) {
      console.error("GitHub Backup error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite integration / Static Assets serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Evergrove server booting on http://0.0.0.0:${PORT}`);
  });
}

startServer();
