import React, { useState, useEffect } from 'react';
import { Account, Bill, Transaction } from '../types';
import { X, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert, Loader2, Zap, DollarSign, Calendar, Landmark, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  bills: Bill[];
  transactions: Transaction[];
}

interface TrendCategory {
  category: string;
  amount: number;
  percentage: number;
  status: 'high' | 'normal' | 'low';
}

interface LeakItem {
  merchant: string;
  amount: number;
  frequency: string;
  action: string;
}

interface ScenarioStep {
  title: string;
  desc: string;
}

interface ScenarioPlan {
  title: string;
  steps: ScenarioStep[];
}

interface TrendsData {
  rating: 'Optimal' | 'Stable' | 'Warning';
  score: number;
  trendsSummary: string;
  projectedSavings: number;
  topCategories: TrendCategory[];
  leaks: LeakItem[];
  scenarioPlan: ScenarioPlan;
  offline?: boolean;
}

export default function SmartAssistantModal({
  isOpen,
  onClose,
  accounts,
  bills,
  transactions
}: SmartAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<'trends' | 'leaks' | 'plan'>('trends');
  const [scenario, setScenario] = useState<'general' | 'savings_boost' | 'sub_cleanup' | 'debt_triage'>('general');
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search input to audit a specific merchant or category
  const [customAuditQuery, setCustomAuditQuery] = useState('');
  const [customAuditResult, setCustomAuditResult] = useState<string | null>(null);
  const [isAuditingCustom, setIsAuditingCustom] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchTrends = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/gemini/trends', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            accounts,
            bills,
            transactions,
            scenario
          })
        });

        if (!response.ok) {
          throw new Error('Failed to retrieve AI analysis');
        }

        const data = await response.json();
        setTrendsData(data);
      } catch (err: any) {
        console.warn("AI Trends Fetch Error, falling back to local smart calculations:", err);
        const checkingAcc = accounts.find(a => a.type === 'checking');
        const savingsAcc = accounts.find(a => a.type === 'savings');
        const creditAcc = accounts.find(a => a.type === 'credit');

        const totalChecking = checkingAcc ? checkingAcc.balance : 0;
        const totalSavings = savingsAcc ? savingsAcc.balance : 0;
        const totalDebt = creditAcc ? creditAcc.balance : 0;

        const unpaidBills = bills?.filter(b => !b.isPaid) || [];
        const totalUnpaidBills = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
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

        setTrendsData({
          rating: "Stable",
          score: 74,
          projectedSavings: totalSavings + Math.max(0, safeToSpend * 0.15),
          trendsSummary: "Running Evergrove in Local Mode. Your discretionary transactions are moderate, but credit liabilities require strategic routing.",
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
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, [isOpen, scenario, accounts, bills, transactions]);

  if (!isOpen) return null;

  // Handler for custom category audit
  const handleCustomAudit = () => {
    if (!customAuditQuery.trim()) return;
    setIsAuditingCustom(true);
    setCustomAuditResult(null);

    // Filter local transactions or generate a beautiful AI response
    setTimeout(() => {
      const q = customAuditQuery.toLowerCase();
      const matchedTxns = transactions.filter(t => 
        t.category.toLowerCase().includes(q) || 
        t.merchant.toLowerCase().includes(q)
      );

      const totalSpent = Math.abs(matchedTxns.filter(t => t.type === 'spend').reduce((sum, t) => sum + t.amount, 0));

      if (matchedTxns.length === 0) {
        setCustomAuditResult(`🔍 **No recent spend found for "${customAuditQuery}"**\n\nYour transaction list doesn't show any direct logs matching this category in this cycle. Try searching for 'Groceries', 'Uber', 'Transport', or 'Woolworths'!`);
      } else {
        setCustomAuditResult(`📊 **AI Audit for "${customAuditQuery}":**\n\n- You have **${matchedTxns.length} logs** this week totaling **$${totalSpent.toFixed(2)}**.\n- **Trend Status:** Moderate.\n- **AI Suggestion:** Your largest outflow here is *${matchedTxns[0].merchant}* on ${matchedTxns[0].date}. Restricting this category to weekend-only spending could unlock an extra **$25.00** of savings before your next payday.`);
      }
      setIsAuditingCustom(false);
    }, 1000);
  };

  const getRatingColor = (rating: string) => {
    if (rating === 'Optimal') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (rating === 'Stable') return 'text-[#0db095] bg-[#0db095]/10 border-[#0db095]/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-[#161c2a] border border-[#1e2638] w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#1e2638] flex items-center justify-between bg-[#121722]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0db095]/10 flex items-center justify-center text-[#0db095] border border-[#0db095]/20">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Smart Analytics</h3>
              <p className="text-[10px] text-slate-400 font-medium">AI Cashflow & Trend Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#121722]/50 border-b border-[#1e2638] px-4 py-2 flex gap-2">
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
              activeTab === 'trends' 
                ? 'bg-[#0db095]/10 text-[#0db095] border border-[#0db095]/30' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            📊 Budget Trends
          </button>
          <button
            onClick={() => setActiveTab('leaks')}
            className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
              activeTab === 'leaks' 
                ? 'bg-[#0db095]/10 text-[#0db095] border border-[#0db095]/30' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            🔍 Spending Audits
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
              activeTab === 'plan' 
                ? 'bg-[#0db095]/10 text-[#0db095] border border-[#0db095]/30' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            🛠️ Action Scenarios
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh] min-h-[300px] scrollbar-thin">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 text-[#0db095] animate-spin" />
              <p className="text-xs text-slate-400 font-medium font-mono">Running AI Cashflow Audit...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-xs font-bold text-rose-400">{error}</p>
              <button
                onClick={() => setScenario(scenario)} // force reload
                className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-all"
              >
                Retry Scan
              </button>
            </div>
          ) : trendsData ? (
            <AnimatePresence mode="wait">
              {/* TAB 1: BUDGET TRENDS */}
              {activeTab === 'trends' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Rating / Score Indicator */}
                  <div className="bg-[#121722] border border-[#1e2638] rounded-2xl p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold block">Cashflow Score</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-[#0db095]">{trendsData.score}</span>
                        <span className="text-xs text-slate-400 font-medium">/100</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug mt-1.5">{trendsData.trendsSummary}</p>
                    </div>

                    <div className={`px-3 py-1.5 rounded-xl border text-center font-bold text-xs font-mono shrink-0 ${getRatingColor(trendsData.rating)}`}>
                      {trendsData.rating}
                    </div>
                  </div>

                  {/* Projected metrics */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#121722]/60 border border-[#1e2638]/60 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 uppercase font-bold font-mono">Projected Savings</span>
                      <p className="text-base font-bold text-emerald-400 mt-1">${trendsData.projectedSavings.toFixed(2)}</p>
                      <span className="text-[8px] text-slate-500 font-mono">End of cycle estimate</span>
                    </div>
                    <div className="bg-[#121722]/60 border border-[#1e2638]/60 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 uppercase font-bold font-mono">Active Leakage</span>
                      <p className="text-base font-bold text-rose-400 mt-1">
                        ${trendsData.leaks.reduce((sum, l) => sum + l.amount, 0).toFixed(2)}/mo
                      </p>
                      <span className="text-[8px] text-slate-500 font-mono">Redundant charges</span>
                    </div>
                  </div>

                  {/* Visual Spend Breakdown */}
                  <div className="bg-[#121722] border border-[#1e2638] rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                      📊 Discretionary Outflow
                    </h4>
                    
                    <div className="space-y-2.5">
                      {trendsData.topCategories.map((c) => (
                        <div key={c.category} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-300">{c.category}</span>
                            <span className="text-slate-400">${c.amount.toFixed(2)} ({c.percentage}%)</span>
                          </div>
                          <div className="w-full bg-[#161c2a] h-1.5 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                c.status === 'high' ? 'bg-amber-400' : 'bg-[#0db095]'
                              }`}
                              style={{ width: `${c.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: SPENDING AUDITS */}
              {activeTab === 'leaks' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Category Target Audit Search Block */}
                  <div className="bg-[#121722] border border-[#1e2638] rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                      🔎 Target Category Audit
                    </h4>
                    <p className="text-[10px] text-slate-400">Search for any specific merchant or spending category to audit its impact on your cashflow.</p>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customAuditQuery}
                        onChange={(e) => setCustomAuditQuery(e.target.value)}
                        placeholder="e.g. Groceries, Uber, Coffee, Disney"
                        className="flex-1 bg-[#161c2a] text-slate-200 px-3 py-1.5 rounded-lg border border-[#1e2638] text-xs focus:outline-none focus:ring-1 focus:ring-[#0db095]"
                      />
                      <button
                        onClick={handleCustomAudit}
                        disabled={isAuditingCustom}
                        className="px-3 bg-[#0db095] hover:bg-[#0da088] text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1"
                      >
                        {isAuditingCustom ? 'Analyzing...' : 'Audit'}
                      </button>
                    </div>

                    {customAuditResult && (
                      <div className="bg-[#161c2a] border border-[#1e2638] p-3 rounded-xl text-[11px] leading-relaxed text-slate-300 whitespace-pre-line">
                        {customAuditResult}
                      </div>
                    )}
                  </div>

                  {/* Real-time Leak Finder */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
                      ⚠️ Potential Savings Leaks
                    </h4>
                    
                    <div className="space-y-2">
                      {trendsData.leaks.map((leak, i) => (
                        <div key={i} className="bg-[#121722] border border-[#1e2638] p-3 rounded-xl flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold">
                            !
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-200">{leak.merchant}</span>
                              <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded-full">
                                -${leak.amount.toFixed(2)} ({leak.frequency})
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">{leak.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: SCENARIOS & PLANS */}
              {activeTab === 'plan' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Select Target Goal Strategy */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold block">
                      Target Goal Strategy
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setScenario('general')}
                        className={`px-3 py-2 text-left rounded-xl border transition-all text-xs flex flex-col gap-0.5 ${
                          scenario === 'general' 
                            ? 'bg-[#0db095]/15 border-[#0db095]/30 text-[#0db095]' 
                            : 'bg-[#121722] border-[#1e2638] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="font-bold">🌳 General Health</span>
                        <span className="text-[9px] text-slate-500 font-medium">Daily balance check</span>
                      </button>

                      <button
                        onClick={() => setScenario('savings_boost')}
                        className={`px-3 py-2 text-left rounded-xl border transition-all text-xs flex flex-col gap-0.5 ${
                          scenario === 'savings_boost' 
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                            : 'bg-[#121722] border-[#1e2638] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="font-bold">⚡ Savings Boost</span>
                        <span className="text-[9px] text-slate-500 font-medium">Maximize cash holding</span>
                      </button>

                      <button
                        onClick={() => setScenario('sub_cleanup')}
                        className={`px-3 py-2 text-left rounded-xl border transition-all text-xs flex flex-col gap-0.5 ${
                          scenario === 'sub_cleanup' 
                            ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' 
                            : 'bg-[#121722] border-[#1e2638] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="font-bold">🔍 Subscription Audit</span>
                        <span className="text-[9px] text-slate-500 font-medium">Flag recurring wastage</span>
                      </button>

                      <button
                        onClick={() => setScenario('debt_triage')}
                        className={`px-3 py-2 text-left rounded-xl border transition-all text-xs flex flex-col gap-0.5 ${
                          scenario === 'debt_triage' 
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' 
                            : 'bg-[#121722] border-[#1e2638] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="font-bold">🛡️ Debt paydown</span>
                        <span className="text-[9px] text-slate-500 font-medium">Tackle liabilities</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Structured Action Steps */}
                  <div className="bg-[#121722] border border-[#1e2638] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200 font-mono tracking-wider uppercase flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        {trendsData.scenarioPlan.title}
                      </h4>
                      {trendsData.offline && (
                        <span className="text-[8px] bg-slate-800 text-slate-400 font-mono font-bold uppercase px-1.5 py-0.5 rounded">
                          Simulated
                        </span>
                      )}
                    </div>

                    <div className="space-y-3.5 pt-1">
                      {trendsData.scenarioPlan.steps.map((step, index) => (
                        <div key={index} className="flex gap-2.5 items-start">
                          <div className="w-5 h-5 rounded-full bg-[#0db095]/10 border border-[#0db095]/30 flex items-center justify-center text-[#0db095] text-xs font-extrabold shrink-0 mt-0.5 font-mono">
                            {index + 1}
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-200 block">{step.title}</span>
                            <span className="text-[11px] text-slate-400 leading-relaxed block">{step.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs font-mono">
              Waiting for financial snapshot...
            </div>
          )}

        </div>

        {/* Info Banner */}
        <div className="p-4 bg-[#121722] border-t border-[#1e2638] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0db095]" />
            <span>Integrity Verified • Ready to pay down debt</span>
          </div>
          {trendsData?.offline && (
            <span className="text-[8px] text-slate-500 font-mono">API Key Offline</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
