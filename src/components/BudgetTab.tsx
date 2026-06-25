import React, { useState, useEffect } from 'react';
import { Account, Bill } from '../types';
import { ShieldCheck, Calendar, Info, Check, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface BudgetTabProps {
  accounts: Account[];
  bills: Bill[];
  onAddBill: (bill: Omit<Bill, 'id'>) => void;
}

export default function BudgetTab({ accounts, bills, onAddBill }: BudgetTabProps) {
  // Simulator state
  const [calcMode, setCalcMode] = useState<'one-off' | 'saving-up' | 'installments'>('installments');
  const [price, setPrice] = useState<number>(1000);
  const [paymentsCount, setPaymentsCount] = useState<number>(4);
  const [everyWeeks, setEveryWeeks] = useState<number>(2);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Safe to Spend base calculations
  const checkingAcc = accounts.find(a => a.type === 'checking');
  const activeBalance = checkingAcc ? checkingAcc.balance : 0;
  const totalUnpaidBills = bills.filter(b => !b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const safeToSpend = Math.max(0, activeBalance - totalUnpaidBills);

  // Dynamic values
  const repaymentAmount = paymentsCount > 0 ? price / paymentsCount : 0;
  const weeklyAddition = everyWeeks > 0 ? repaymentAmount / everyWeeks : 0;

  // Let's assume the user has a weekly discretionary budget of $421.65
  const baseWeeklyDiscretionary = 421.65;
  const spareBudgetAfter = Math.max(0, baseWeeklyDiscretionary - weeklyAddition);

  // Comfort evaluation
  const isComfortable = spareBudgetAfter > 150;

  // Add simulator as bill
  const handleAddToBudget = () => {
    const todayStr = new Date('2026-06-25').toISOString().split('T')[0];
    onAddBill({
      name: `Installment: ${price} Item`,
      amount: repaymentAmount,
      category: 'Bills',
      frequency: everyWeeks === 1 ? 'weekly' : everyWeeks === 2 ? 'fortnightly' : 'monthly',
      dueDate: todayStr,
      isPaid: false,
      isCovered: true,
      isAuto: true,
      isReady: true
    });
    setSuccessMessage(`Successfully added ${paymentsCount} payments of $${repaymentAmount.toFixed(2)} to your bills calendar!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-4 px-4 pb-6">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono block">Simulate Purchases</span>
        <h2 className="text-xl font-bold text-slate-100 mt-0.5">Affordability Analysis</h2>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-medium flex items-center gap-2"
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {/* "Can I Afford It?" Simulator Widget (Screen 1 design) */}
      <div className="bg-[#161c2a] rounded-2xl p-5 border border-[#1e2638] shadow-lg space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono block">Can I Afford It?</span>
          <div className="grid grid-cols-3 gap-1 bg-[#121722] p-1 rounded-xl border border-[#1e2638]/50">
            {(['one-off', 'saving-up', 'installments'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCalcMode(mode)}
                className={`py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  calcMode === mode
                    ? 'bg-[#0db095] text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Currency Input Box */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Price</span>
          <div className="bg-[#121722] rounded-xl px-4 py-3 border border-[#1e2638] flex items-center">
            <span className="text-2xl font-bold text-slate-400 mr-2">$</span>
            <input
              type="number"
              value={price || ''}
              onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
              className="w-full bg-transparent text-2xl font-bold text-slate-100 focus:outline-none focus:ring-0"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Installments Details Grid */}
        {calcMode === 'installments' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Number of payments</span>
              <input
                type="number"
                value={paymentsCount || ''}
                onChange={(e) => setPaymentsCount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[#121722] text-slate-100 px-3 py-2.5 rounded-xl border border-[#1e2638] text-xs focus:outline-none focus:border-[#0db095]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Every (weeks)</span>
              <input
                type="number"
                value={everyWeeks || ''}
                onChange={(e) => setEveryWeeks(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[#121722] text-slate-100 px-3 py-2.5 rounded-xl border border-[#1e2638] text-xs focus:outline-none focus:border-[#0db095]"
              />
            </div>
          </div>
        )}

        {/* Real-time Result output */}
        <div className="bg-[#121722] rounded-xl p-4 border border-[#1e2638]/60 space-y-3.5">
          <div className="flex items-center gap-2">
            {isComfortable ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">Comfortable — easily on track</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-400">Tight — limits your weekly cushion</span>
              </>
            )}
          </div>

          <div className="space-y-2 border-t border-[#1e2638]/40 pt-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Repayments</span>
              <span className="font-semibold text-slate-200">
                {paymentsCount} × ${repaymentAmount.toFixed(2)} / {everyWeeks} wks
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Adds to your spending</span>
              <span className="font-semibold text-[#0db095]">+{calcMode === 'one-off' ? `$${price.toFixed(2)}` : `$${weeklyAddition.toFixed(2)}`}/wk</span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Spare budget after</span>
              <span className={`font-semibold ${isComfortable ? 'text-emerald-400' : 'text-amber-400'}`}>
                ${spareBudgetAfter.toFixed(2)}/wk
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed italic">
            First payment today, then {paymentsCount - 1} more every {everyWeeks} wks - paid off in {((paymentsCount - 1) * everyWeeks)} wks
          </p>

          <button
            onClick={handleAddToBudget}
            className="w-full py-2.5 bg-[#0db095] hover:bg-[#0da088] text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
          >
            + Add to Budget as a Bill
          </button>
        </div>
      </div>

      {/* Safe to Spend Details Card (matching bottom of screen 1) */}
      <div className="bg-[#161c2a] rounded-2xl p-4 border border-[#1e2638] shadow-md space-y-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono block">Safe To Spend</span>
          <h3 className="text-2xl font-bold text-[#0db095] mt-1">${safeToSpend.toFixed(2)}</h3>
          <p className="text-xs text-slate-400 mt-0.5">After bills, savings and essentials</p>
        </div>

        <div className="bg-[#121722] rounded-xl p-3 border border-[#1e2638]/50 flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-indigo-400">Owed back</span>
            <p className="text-[10px] text-slate-400 mt-0.5">If paid back</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-indigo-400">$160.00</span>
            <p className="text-xs font-bold text-emerald-400 mt-0.5">${(safeToSpend + 160.00).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
