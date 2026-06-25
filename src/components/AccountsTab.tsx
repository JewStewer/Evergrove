import React, { useState } from 'react';
import { Account } from '../types';
import { Landmark, PiggyBank, CreditCard, TrendingUp, Plus, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccountsTabProps {
  accounts: Account[];
  onUpdateAccountBalance: (id: string, newBalance: number) => void;
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
}

export default function AccountsTab({ accounts, onUpdateAccountBalance, onAddAccount }: AccountsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<Account['type']>('checking');
  const [newAccBalance, setNewAccBalance] = useState('');

  // Calculations
  const checkingTotal = accounts.filter(a => a.type === 'checking').reduce((sum, a) => sum + a.balance, 0);
  const savingsTotal = accounts.filter(a => a.type === 'savings').reduce((sum, a) => sum + a.balance, 0);
  const creditTotal = accounts.filter(a => a.type === 'credit').reduce((sum, a) => sum + a.balance, 0);
  const investmentsTotal = accounts.filter(a => a.type === 'investment').reduce((sum, a) => sum + a.balance, 0);

  const assets = checkingTotal + savingsTotal + investmentsTotal;
  const liabilities = Math.abs(creditTotal);
  const netWorth = assets - liabilities;

  const handleStartEdit = (acc: Account) => {
    setEditingId(acc.id);
    setEditValue(acc.balance.toString());
  };

  const handleSaveEdit = (id: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      onUpdateAccountBalance(id, val);
    }
    setEditingId(null);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(newAccBalance);
    if (newAccName.trim() && !isNaN(bal)) {
      onAddAccount({
        name: newAccName.trim(),
        type: newAccType,
        balance: newAccType === 'credit' ? -Math.abs(bal) : bal
      });
      setNewAccName('');
      setNewAccBalance('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4 px-4 pb-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono block">Balances</span>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5">Accounts & Portfolio</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-[#1e2638] hover:bg-[#242f45] text-slate-200 rounded-xl font-semibold flex items-center gap-1 transition-all text-xs border border-slate-700/50"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Add Account'}</span>
        </button>
      </div>

      {/* Net Worth Hero Overview */}
      <div className="bg-[#161c2a] rounded-2xl p-5 border border-[#1e2638] shadow-lg space-y-4">
        <div className="text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono block">Computed Net Worth</span>
          <h3 className={`text-2xl font-bold mt-1 tracking-tight ${netWorth >= 0 ? 'text-[#0db095]' : 'text-rose-400'}`}>
            ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        {/* Assets vs Liabilities bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>Assets (${assets.toLocaleString()})</span>
            <span>Liabilities (${liabilities.toLocaleString()})</span>
          </div>
          <div className="w-full bg-rose-500/30 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-[#0db095] h-full transition-all duration-500"
              style={{ width: `${assets + liabilities > 0 ? (assets / (assets + liabilities)) * 100 : 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Account Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddAccount}
            className="bg-[#161c2a] rounded-2xl p-4 border border-[#1e2638] space-y-3 overflow-hidden shadow-md"
          >
            <h4 className="text-xs font-bold text-slate-200">New Simulated Account</h4>
            <div className="space-y-2.5">
              <div>
                <label className="text-[9px] uppercase text-slate-400 font-semibold block mb-1">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chase Savings, Coinbase, Cash"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full bg-[#121722] text-slate-100 px-3 py-2 rounded-xl border border-[#1e2638] text-xs focus:outline-none focus:border-[#0db095]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] uppercase text-slate-400 font-semibold block mb-1">Type</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as Account['type'])}
                    className="w-full bg-[#121722] text-slate-100 px-2 py-2 rounded-xl border border-[#1e2638] text-xs focus:outline-none"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit">Liabilities / Credit</option>
                    <option value="investment">Investment</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase text-slate-400 font-semibold block mb-1">Balance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    className="w-full bg-[#121722] text-slate-100 px-3 py-2 rounded-xl border border-[#1e2638] text-xs focus:outline-none focus:border-[#0db095]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#0db095] hover:bg-[#0da088] text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-sm"
              >
                Simulate Account Addition
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Accounts List */}
      <div className="space-y-2">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-[#161c2a] rounded-xl p-3.5 border border-[#1e2638] flex items-center justify-between shadow-sm group hover:border-[#242f45] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                acc.type === 'savings' ? 'bg-emerald-500/10 text-emerald-400' :
                acc.type === 'credit' ? 'bg-rose-500/10 text-rose-400' :
                acc.type === 'investment' ? 'bg-indigo-500/10 text-indigo-400' :
                'bg-slate-500/10 text-slate-400'
              }`}>
                {acc.type === 'savings' ? <PiggyBank className="w-4 h-4" /> :
                 acc.type === 'credit' ? <CreditCard className="w-4 h-4" /> :
                 acc.type === 'investment' ? <TrendingUp className="w-4 h-4" /> :
                 <Landmark className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">{acc.name}</h4>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">{acc.type}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingId === acc.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-20 bg-[#121722] text-slate-100 px-2 py-1 rounded border border-slate-700 text-xs text-right font-mono focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(acc.id)}
                    className="p-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className={`text-xs font-bold font-mono ${acc.balance >= 0 ? 'text-slate-200' : 'text-rose-400'}`}>
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => handleStartEdit(acc)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 text-slate-500 hover:text-slate-300 rounded transition-all"
                    title="Edit Balance"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
