import React, { useState } from 'react';
import { Bill } from '../types';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBill: (bill: Omit<Bill, 'id'>) => void;
}

export default function AddBillModal({ isOpen, onClose, onAddBill }: AddBillModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Bills');
  const [frequency, setFrequency] = useState<Bill['frequency']>('monthly');
  const [dueDate, setDueDate] = useState('2026-06-30');
  const [isCovered, setIsCovered] = useState(true);
  const [isAuto, setIsAuto] = useState(false);
  const [isReady, setIsReady] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (name.trim() && !isNaN(val)) {
      onAddBill({
        name: name.trim(),
        amount: val,
        category,
        frequency,
        dueDate,
        isPaid: false,
        isCovered,
        isAuto,
        isReady
      });
      setName('');
      setAmount('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="bg-[#161c2a] border border-[#1e2638] w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-[#1e2638] flex items-center justify-between bg-[#121722]">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Add Bill Reminder</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1.5">Bill Name / Service</label>
            <input
              type="text"
              placeholder="e.g. Netflix, Electricity, Gym"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                <option value="Bills">Bills</option>
                <option value="Subscriptions">Subscriptions</option>
                <option value="Rent">Rent & Living</option>
                <option value="Utilities">Utilities</option>
                <option value="Insurance">Insurance</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1.5">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Bill['frequency'])}
                className="w-full bg-[#121722] text-slate-100 px-3 py-2.5 rounded-xl border border-[#1e2638] text-xs focus:outline-none focus:border-[#0db095]"
              >
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#121722] text-slate-100 px-3.5 py-2.5 rounded-xl border border-[#1e2638] text-xs focus:outline-none focus:border-[#0db095]"
                required
              />
            </div>
          </div>

          {/* Tag parameters from Screen 2 */}
          <div className="space-y-2.5 bg-[#121722] p-3 rounded-xl border border-[#1e2638]/50">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Status Tags</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isCovered}
                  onChange={(e) => setIsCovered(e.target.checked)}
                  className="rounded border-[#1e2638] text-[#0db095] focus:ring-[#0db095] focus:ring-opacity-20 bg-slate-800"
                />
                <span>Covered</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAuto}
                  onChange={(e) => setIsAuto(e.target.checked)}
                  className="rounded border-[#1e2638] text-[#0db095] focus:ring-[#0db095] focus:ring-opacity-20 bg-slate-800"
                />
                <span>Auto</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isReady}
                  onChange={(e) => setIsReady(e.target.checked)}
                  className="rounded border-[#1e2638] text-[#0db095] focus:ring-[#0db095] focus:ring-opacity-20 bg-slate-800"
                />
                <span>Ready</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0db095] hover:bg-[#0da088] text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md mt-2"
          >
            Create Bill Entry
          </button>
        </form>
      </motion.div>
    </div>
  );
}
