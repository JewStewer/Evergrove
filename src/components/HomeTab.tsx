import React, { useState, useEffect } from 'react';
import { Account, Bill, Transaction, PayCycle } from '../types';
import { RefreshCw, TrendingDown, ShieldAlert, ArrowUpRight, ArrowDownLeft, Plus, Calendar, ShieldCheck, HelpCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeTabProps {
  accounts: Account[];
  bills: Bill[];
  transactions: Transaction[];
  payCycle: PayCycle;
  noSpendMode: boolean;
  setNoSpendMode: (val: boolean) => void;
  setActiveTab: (tab: string) => void;
  onAddSpendOpen: () => void;
  onAddBillOpen: () => void;
  onSmartAssistantOpen: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

interface AIInsight {
  insight: string;
  tag: string;
  safeDailyLimit?: number;
  safeDailyLimitExplanation?: string;
}

export default function HomeTab({
  accounts,
  bills,
  transactions,
  payCycle,
  noSpendMode,
  setNoSpendMode,
  setActiveTab,
  onAddSpendOpen,
  onAddBillOpen,
  onSmartAssistantOpen,
  onSync,
  isSyncing
}: HomeTabProps) {
  // Calculations
  const checkingAcc = accounts.find(a => a.type === 'checking');
  const savingsAcc = accounts.find(a => a.type === 'savings');
  const debtAcc = accounts.find(a => a.type === 'credit');

  const activeBalance = checkingAcc ? checkingAcc.balance : 0;
  const savings = savingsAcc ? savingsAcc.balance : 0;
  const debt = debtAcc ? Math.abs(debtAcc.balance) : 0;
  const netWorth = activeBalance + savings - debt;

  // Spent/Made since payday
  const spendTxns = transactions.filter(t => t.type === 'spend' && t.date >= payCycle.startDate);
  const totalSpentSincePayday = Math.abs(spendTxns.reduce((sum, t) => sum + t.amount, 0));
  
  const incomeTxns = transactions.filter(t => t.type === 'income' && t.date >= payCycle.startDate);
  const totalMadeSincePayday = incomeTxns.reduce((sum, t) => sum + t.amount, 0);

  const cycleNet = totalMadeSincePayday - totalSpentSincePayday;

  // Countdown to payday
  const today = new Date('2026-06-25');
  const payday = new Date(payCycle.paydayDate);
  const diffTime = payday.getTime() - today.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Daily budget calculations
  const totalDaysInCycle = 7;
  const daysSpentSoFar = 3; // June 23 to 25
  const daysRemaining = Math.max(1, diffDays);
  // Safe to spend calculation
  const totalUnpaidBills = bills.filter(b => !b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const safeToSpend = Math.max(0, activeBalance - totalUnpaidBills);
  const dailySpendLimit = (safeToSpend / daysRemaining).toFixed(2);

  // AI Insight State
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);

  // Fetch real-time personalized AI insight based on actual financial data
  useEffect(() => {
    let active = true;
    const fetchInsight = async () => {
      setLoadingInsight(true);
      try {
        const response = await fetch('/api/gemini/insight', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            accounts,
            bills,
            transactions,
            noSpendMode,
            daysRemaining
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (active) {
            setAiInsight(data);
          }
        } else {
          throw new Error('Response not OK');
        }
      } catch (err) {
        console.warn("Could not load real-time AI insight, falling back to local formulas.", err);
        if (active) {
          setAiInsight({
            insight: `💡 Your current Safe-to-Spend is $${safeToSpend.toFixed(2)}. Consider turning on No-Spend Mode to completely secure your upcoming Swoosh ($66.53) bill payment.`,
            tag: "Cashflow Guard",
            safeDailyLimit: parseFloat(dailySpendLimit),
            safeDailyLimitExplanation: `Calculated standard offline limit based on checking balance minus $${totalUnpaidBills.toFixed(2)} unpaid bills over ${daysRemaining} days remaining.`
          });
        }
      } finally {
        if (active) {
          setLoadingInsight(false);
        }
      }
    };

    fetchInsight();
    return () => {
      active = false;
    };
  }, [accounts, bills, transactions, noSpendMode, safeToSpend]);

  // Formatter
  const formatCurrency = (val: number) => {
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    return `${isNeg ? '-' : ''}$${absVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Syncing Ribbon */}
      <AnimatePresence>
        {bills.some(b => !b.isPaid && b.name === 'Disney+') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-400 font-medium"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>🚨 <strong>Bills due soon:</strong> Disney+ (in 3d)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Frame wrapper with layout set to true enables spring physics for ALL siblings when warning box triggers */}
      <motion.div layout className="px-4 space-y-4">
        
        {/* Core Card */}
        <motion.div layout className="bg-[#161c2a] rounded-2xl p-5 border border-[#1e2638] shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono flex items-center gap-1">
              🌳 Evergrove Core
            </span>
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#1e2638] hover:bg-[#242f45] active:scale-95 transition-all text-xs rounded-full font-medium text-slate-300 border border-slate-700"
            >
              <RefreshCw className={`w-3 h-3 text-[#0db095] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>

          <div className="text-center mb-6">
            <p className="text-slate-400 text-xs font-medium">TOTAL ACTIVE BALANCE</p>
            <h2 className="text-3xl font-bold text-[#0db095] tracking-tight mt-1">
              {formatCurrency(activeBalance)}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-[#1e2638]/60 pt-4 text-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">📈 Net Worth</p>
              <p className={`text-sm font-semibold mt-1 ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(netWorth)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">💎 Savings</p>
              <p className="text-sm font-semibold text-emerald-400 mt-1">
                {formatCurrency(savings)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">💳 Debt</p>
              <p className="text-sm font-semibold text-rose-400 mt-1">
                {formatCurrency(-debt)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Today's Brief Card - AI Safe Spend Guide */}
        <motion.div layout className="bg-[#161c2a] rounded-2xl p-4 border border-[#1e2638] shadow-md space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono flex items-center gap-1">
              ✨ AI Safe Daily Spend
            </span>
            <span className="text-[9px] font-extrabold text-[#0db095] bg-[#0db095]/10 border border-[#0db095]/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono flex items-center gap-1 animate-pulse">
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI Recommended</span>
            </span>
          </div>

          <div className="flex justify-between items-end">
            <div className="space-y-1">
              {loadingInsight ? (
                <div className="h-7 bg-slate-800 rounded animate-pulse w-24" />
              ) : (
                <h3 className="text-2xl font-extrabold text-[#0db095] tracking-tight">
                  ${aiInsight?.safeDailyLimit ? aiInsight.safeDailyLimit.toFixed(2) : dailySpendLimit}
                  <span className="text-xs text-slate-400 font-normal"> / day</span>
                </h3>
              )}
              {loadingInsight ? (
                <div className="h-3 bg-slate-800 rounded animate-pulse w-48 mt-1" />
              ) : (
                <p className="text-[11px] text-slate-300 leading-normal font-medium">
                  {aiInsight?.safeDailyLimitExplanation || `${dailySpendLimit} per day keeps you steady until payday.`}
                </p>
              )}
            </div>
            <button
              onClick={onAddSpendOpen}
              className="flex items-center justify-center bg-[#1e2638] hover:bg-[#242f45] text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700/50 transition-all active:scale-95 shrink-0"
            >
              Add Spend
            </button>
          </div>
        </motion.div>

        {/* AI Smart Insight Card */}
        <motion.div
          layout
          className="bg-[#11192e] rounded-2xl p-4 border border-[#1f2d4e] shadow-lg relative overflow-hidden"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        >
          {/* Subtle colored glow background */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#0db095]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0db095] animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold font-mono">
                Evergrove AI Insight
              </span>
            </div>
            {aiInsight?.tag && (
              <span className="text-[8px] font-extrabold text-[#0db095] bg-[#0db095]/10 border border-[#0db095]/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                {aiInsight.tag}
              </span>
            )}
          </div>

          {loadingInsight ? (
            <div className="space-y-2 py-1">
              <div className="h-3 bg-slate-800 rounded animate-pulse w-11/12" />
              <div className="h-3 bg-slate-800 rounded animate-pulse w-3/4" />
            </div>
          ) : (
            <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
              {aiInsight?.insight}
            </p>
          )}
        </motion.div>

        {/* Pay Cycle Progress Card */}
        <motion.div layout className="bg-[#161c2a] rounded-2xl p-4 border border-[#1e2638] shadow-md space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono block">🔄 Pay Cycle</span>
              <span className="text-xs font-semibold text-slate-200 block mt-1">23 June - 29 June</span>
            </div>
            <span className="text-xs font-bold text-[#0db095] bg-[#0db095]/10 px-2.5 py-1 rounded-full">📅 {diffDays}d to payday</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#0db095] h-full rounded-full transition-all duration-500"
              style={{ width: `${(daysSpentSoFar / totalDaysInCycle) * 100}%` }}
            />
          </div>

          {/* Pay cycle metrics grid */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-[#121722] rounded-xl p-3 border border-[#1e2638]/50 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Spent Since Payday</span>
              <span className="text-sm font-bold text-rose-400 block mt-1.5">{formatCurrency(totalSpentSincePayday)}</span>
            </div>
            <div className="bg-[#121722] rounded-xl p-3 border border-[#1e2638]/50 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Made Since Payday</span>
              <span className="text-sm font-bold text-emerald-400 block mt-1.5">{formatCurrency(totalMadeSincePayday)}</span>
            </div>
            <div className="bg-[#121722] rounded-xl p-3 border border-[#1e2638]/50 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Cycle Net</span>
              <span className="text-sm font-bold text-[#0db095] block mt-1.5">{formatCurrency(cycleNet)}</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div layout className="grid grid-cols-5 gap-2">
          <button
            onClick={onAddSpendOpen}
            className="flex flex-col items-center justify-center bg-[#161c2a] hover:bg-[#1e2638] border border-[#1e2638] rounded-xl p-2.5 transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-[#0db095]/10 flex items-center justify-center text-[#0db095] mb-1">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-200">💸 Spend</span>
            <span className="text-[8px] text-slate-500 text-center mt-0.5">Record txn</span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className="flex flex-col items-center justify-center bg-[#161c2a] hover:bg-[#1e2638] border border-[#1e2638] rounded-xl p-2.5 transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-200">📊 Budget</span>
            <span className="text-[8px] text-slate-500 text-center mt-0.5">Limits</span>
          </button>

          <button
            onClick={onAddBillOpen}
            className="flex flex-col items-center justify-center bg-[#161c2a] hover:bg-[#1e2638] border border-[#1e2638] rounded-xl p-2.5 transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 mb-1">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-200">📅 Bill</span>
            <span className="text-[8px] text-slate-500 text-center mt-0.5">Schedule</span>
          </button>

          <button
            onClick={onSmartAssistantOpen}
            className="flex flex-col items-center justify-center bg-[#161c2a] hover:bg-[#1e2638] border border-[#1e2638] rounded-xl p-2.5 transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-1 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-200">📊 AI Trends</span>
            <span className="text-[8px] text-slate-500 text-center mt-0.5">Budget plan</span>
          </button>

          <button
            onClick={() => setNoSpendMode(!noSpendMode)}
            className={`flex flex-col items-center justify-center border rounded-xl p-2.5 transition-all active:scale-95 ${
              noSpendMode 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' 
                : 'bg-[#161c2a] hover:bg-[#1e2638] border-[#1e2638] text-slate-200'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${noSpendMode ? 'bg-amber-500/25 text-amber-400' : 'bg-slate-500/10 text-slate-400'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold">🛑 No Spend</span>
            <span className="text-[8px] text-slate-500 text-center mt-0.5">{noSpendMode ? 'Active' : 'Lock it'}</span>
          </button>
        </motion.div>

        {/* No-Spend Mode Warning Card - Layout animated with butter-smooth height transitions */}
        <AnimatePresence initial={false}>
          {noSpendMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20 shadow-md space-y-2 mb-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-amber-400">🛑 NO-SPEND MODE ACTIVE</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Treating today as bills and essentials only! Lock down your dynamic discretionary budget to boost your end-of-month savings pool.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Safe To Spend Card */}
        <motion.div layout className="bg-[#161c2a] rounded-2xl p-4 border border-[#1e2638] shadow-md space-y-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono block">🛡️ Safe To Spend</span>
            <h3 className="text-2xl font-bold text-[#0db095] mt-1">{formatCurrency(safeToSpend)}</h3>
            <p className="text-xs text-slate-400 mt-0.5">After bills, savings and essentials</p>
          </div>

          <div className="bg-[#121722] rounded-xl p-3 border border-[#1e2638]/50 flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-indigo-400">Owed back</span>
              <p className="text-[10px] text-slate-400 mt-0.5">If paid back</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-indigo-400">$160.00</span>
              <p className="text-[11px] font-bold text-emerald-400 mt-0.5">{formatCurrency(safeToSpend + 160.00)}</p>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
