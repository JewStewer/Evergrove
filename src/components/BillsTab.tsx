import React, { useState } from 'react';
import { Bill } from '../types';
import { Search, Plus, Calendar, Check, Circle, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BillsTabProps {
  bills: Bill[];
  onAddBillOpen: () => void;
  onToggleBillPaid: (id: string) => void;
  onDeleteBill: (id: string) => void;
  onMarkAllDuePaid: () => void;
}

export default function BillsTab({
  bills,
  onAddBillOpen,
  onToggleBillPaid,
  onDeleteBill,
  onMarkAllDuePaid
}: BillsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'unpaid' | 'all' | 'paid'>('unpaid');

  const today = new Date('2026-06-25');

  // Compute days left helper
  const getDaysLeft = (dueDateStr: string) => {
    const dueDate = new Date(dueDateStr);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter bills
  const filteredBills = bills.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      activeFilter === 'all' ? true : 
      activeFilter === 'paid' ? b.isPaid : !b.isPaid;
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const unpaidBills = bills.filter(b => !b.isPaid);
  
  // Owed before 30 June (including 30 June)
  const june30 = new Date('2026-06-30');
  const owedBeforeJune30 = unpaidBills
    .filter(b => new Date(b.dueDate) <= june30)
    .reduce((sum, b) => sum + b.amount, 0);

  const unpaidCountBeforeJune30 = unpaidBills
    .filter(b => new Date(b.dueDate) <= june30).length;

  // Due Now (overdue or due today)
  const dueNowTotal = unpaidBills
    .filter(b => getDaysLeft(b.dueDate) <= 0)
    .reduce((sum, b) => sum + b.amount, 0);

  // Next 7 days
  const next7DTotal = unpaidBills
    .filter(b => {
      const days = getDaysLeft(b.dueDate);
      return days > 0 && days <= 7;
    })
    .reduce((sum, b) => sum + b.amount, 0);

  // Next 30 days
  const next30DTotal = unpaidBills
    .filter(b => {
      const days = getDaysLeft(b.dueDate);
      return days > 0 && days <= 30;
    })
    .reduce((sum, b) => sum + b.amount, 0);

  // Sort upcoming unpaid bills for the horizontal slider
  const dueSoonBills = [...unpaidBills]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-4 px-4 pb-20 relative">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono block">Bills & Commitments</span>
        <h2 className="text-xl font-bold text-slate-100 mt-0.5">Bill Tracker</h2>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search bills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#161c2a] text-slate-100 pl-10 pr-4 py-2.5 rounded-xl border border-[#1e2638] text-xs focus:outline-none focus:ring-1 focus:ring-[#0db095] transition-all"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['unpaid', 'all', 'paid'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all border ${
              activeFilter === filter
                ? 'bg-[#0db095] text-slate-950 border-[#0db095] shadow-sm'
                : 'bg-[#161c2a] text-slate-400 border-[#1e2638] hover:bg-[#1e2638]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Stats Summary Grid (Screen 2 design) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#161c2a] rounded-xl p-3.5 border border-[#1e2638] flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Owed Before 30 June</span>
          <div className="mt-2">
            <span className="text-lg font-bold text-rose-400">${owedBeforeJune30.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{unpaidCountBeforeJune30} bills unpaid</span>
          </div>
        </div>

        <div className="bg-[#161c2a] rounded-xl p-3.5 border border-[#1e2638] flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Payday</span>
          <div className="mt-2">
            <span className="text-base font-bold text-slate-100">30 June</span>
            <span className="text-[10px] text-[#0db095] block mt-0.5">in 5d</span>
          </div>
        </div>
      </div>

      {/* Small stats row (DUE NOW, NEXT 7D, NEXT 30D) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#161c2a]/60 rounded-xl p-2.5 border border-[#1e2638] text-center">
          <span className="text-[8px] text-slate-400 uppercase font-bold block">Due Now</span>
          <span className={`text-xs font-bold block mt-1.5 ${dueNowTotal > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            ${dueNowTotal.toFixed(2)}
          </span>
        </div>
        <div className="bg-[#161c2a]/60 rounded-xl p-2.5 border border-[#1e2638] text-center">
          <span className="text-[8px] text-slate-400 uppercase font-bold block">Next 7D</span>
          <span className="text-xs font-bold text-slate-100 block mt-1.5">${next7DTotal.toFixed(2)}</span>
        </div>
        <div className="bg-[#161c2a]/60 rounded-xl p-2.5 border border-[#1e2638] text-center">
          <span className="text-[8px] text-slate-400 uppercase font-bold block">Next 30D</span>
          <span className="text-xs font-bold text-slate-100 block mt-1.5">${next30DTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onMarkAllDuePaid}
          className="flex-1 py-2.5 bg-[#1e2638] hover:bg-[#242f45] text-slate-200 rounded-xl text-xs font-semibold border border-slate-700/50 transition-all active:scale-95 text-center"
        >
          Mark due paid
        </button>
        <button
          onClick={onAddBillOpen}
          className="flex-1 py-2.5 bg-[#0db095] hover:bg-[#0da088] text-slate-950 rounded-xl text-xs font-bold transition-all active:scale-95 text-center shadow-md"
        >
          Add Bill
        </button>
      </div>

      {/* DUE SOON Horizontal scroll section */}
      {dueSoonBills.length > 0 && activeFilter !== 'paid' && (
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Due Soon</span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
            {dueSoonBills.map((bill) => {
              const daysLeft = getDaysLeft(bill.dueDate);
              return (
                <div
                  key={bill.id}
                  className="min-w-[110px] snap-start bg-[#161c2a] rounded-xl p-3 border border-[#1e2638] space-y-1 shrink-0"
                >
                  <div className="text-[8px] uppercase tracking-wider bg-slate-800 text-[#0db095] px-1.5 py-0.5 rounded-md font-bold inline-block">
                    {daysLeft <= 0 ? 'Due Now' : `${daysLeft} Days`}
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 truncate">{bill.name}</h4>
                  <p className="text-xs font-bold text-slate-300 font-mono">${bill.amount.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scrollable Bills List */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono block mb-2">Bills List</span>
        <AnimatePresence initial={false}>
          {filteredBills.length > 0 ? (
            filteredBills.map((bill) => {
              const daysLeft = getDaysLeft(bill.dueDate);
              return (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-[#161c2a] rounded-xl p-3.5 border transition-all flex items-center justify-between group ${
                    bill.isPaid ? 'border-slate-800/50 opacity-60' : 'border-[#1e2638] hover:border-[#242f45]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleBillPaid(bill.id)}
                      className="text-slate-400 hover:text-[#0db095] transition-all active:scale-90"
                    >
                      {bill.isPaid ? (
                        <div className="w-5 h-5 rounded-full bg-[#0db095]/10 border border-[#0db095] flex items-center justify-center text-[#0db095]">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{bill.name}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[8px] text-slate-500 font-medium font-mono">
                          {bill.category} • {bill.frequency} • {new Date(bill.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </span>
                        {/* Tags from Screen 2 */}
                        {bill.isCovered && (
                          <span className="text-[8px] px-1.5 py-0.2 bg-[#0db095]/10 text-[#0db095] rounded-md font-bold">Covered</span>
                        )}
                        {bill.isAuto && (
                          <span className="text-[8px] px-1.5 py-0.2 bg-indigo-500/10 text-indigo-400 rounded-md font-bold">Auto</span>
                        )}
                        {bill.isReady && (
                          <span className="text-[8px] px-1.5 py-0.2 bg-amber-500/10 text-amber-400 rounded-md font-bold">Ready</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-200">
                      ${bill.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => onDeleteBill(bill.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded-lg transition-all active:scale-95"
                      title="Delete Bill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-[#161c2a]/50 rounded-2xl border border-dashed border-[#1e2638] space-y-2">
              <p className="text-slate-400 text-xs font-medium">No bills match</p>
              <p className="text-[10px] text-slate-500">Add a bill to start tracking reminders.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Add Action Button */}
      <button
        onClick={onAddBillOpen}
        className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-[#0db095] hover:bg-[#0da088] text-slate-950 flex items-center justify-center shadow-lg active:scale-95 transition-all focus:outline-none"
        title="Add Bill"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
