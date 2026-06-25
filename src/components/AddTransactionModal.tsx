import React, { useState } from 'react';
import { Transaction } from '../types';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (txn: Omit<Transaction, 'id'>) => void;
}

export default function AddTransactionModal({ isOpen, onClose, onAddTransaction }: AddTransactionModalProps) {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [type, setType] = useState<'spend' | 'income'>('spend');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (merchant.trim() && !isNaN(val)) {
      onAddTransaction({
        merchant: merchant.trim(),
        amount: type === 'spend' ? -Math.abs(val) : Math.abs(val),
        category,
        date: new Date('2026-06-25').toISOString().split('T')[0], // lock current mock date
        type
      });
      setMerchant('');
      setAmount('');
      onClose();
    }
  };

  const categories = type === 'spend' 
    ? ['Groceries', 'Transport', 'Food & Drinks', 'Health', 'Shopping', 'Subscriptions', 'Bills', 'Entertainment', 'Others']
    : ['Salary', 'Freelance', 'Investments', 'Gifts', 'Refunds', 'Others'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="bg-[#161c2a] border border-[#1e2638] w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-[#1e2638] flex items-center justify-between bg-[#121722]">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Record Transaction</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex gap-2">
            {(['spend', 'income'] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => {
                  setType(t);
                  setCategory(t === 'spend' ? 'Groceries' : 'Salary');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                  type === t
                    ? 'bg-[#0db095] text-slate-950 border-[#0db095]'
                    : 'bg-[#121722] text-slate-400 border-[#1e2638] hover:bg-[#1e2638]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1.5">Merchant / Source</label>
            <input
              type="text"
              placeholder={type === 'spend' ? 'e.g. Starbucks, Uber, Gas Station' : 'e.g. Weekly Paycheck, Side Hustle'}
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full bg-[#121722] text-slate-100 px-3.5 py-2.5 rounded-xl border border-[#1e2638] text-xs focus:outline-none focus:border-[#0db095]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1.5">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#121722] text-slate-100 px-3.5 py-2.5 rounded-xl border border-[#1e2638] text-xs focus:outline-none focus:border-[#0db095]"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#121722] text-slate-100 px-3 py-2.5 rounded-xl border border-[#1e2638] text-xs focus:outline-none focus:border-[#0db095]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0db095] hover:bg-[#0da088] text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md mt-2"
          >
            Add Transaction
          </button>
        </form>
      </motion.div>
    </div>
  );
}
