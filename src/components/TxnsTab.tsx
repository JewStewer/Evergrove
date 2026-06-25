import React, { useState } from 'react';
import { Transaction } from '../types';
import { Search, Plus, Filter, ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TxnsTabProps {
  transactions: Transaction[];
  onAddSpendOpen: () => void;
  onDeleteTransaction: (id: string) => void;
}

export default function TxnsTab({ transactions, onAddSpendOpen, onDeleteTransaction }: TxnsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'spend' | 'income'>('all');

  // Filter transactions
  const filteredTxns = transactions.filter(t => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || t.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (val: number) => {
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    return `${isNeg ? '-' : ''}$${absVal.toFixed(2)}`;
  };

  return (
    <div className="space-y-4 px-4 pb-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono block">Transactions</span>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5">Cashflow Log</h2>
        </div>
        <button
          onClick={onAddSpendOpen}
          className="p-2 bg-[#0db095] hover:bg-[#0da088] active:scale-95 text-slate-950 rounded-xl font-bold flex items-center gap-1 transition-all text-xs shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Txn</span>
        </button>
      </div>

      {/* Search and Quick Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search merchants, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161c2a] text-slate-100 pl-10 pr-4 py-2.5 rounded-xl border border-[#1e2638] text-xs focus:outline-none focus:ring-1 focus:ring-[#0db095] transition-all"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'spend', 'income'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all border ${
                activeFilter === filter
                  ? 'bg-[#0db095] text-slate-950 border-[#0db095] shadow-sm'
                  : 'bg-[#161c2a] text-slate-400 border-[#1e2638] hover:bg-[#1e2638]'
              }`}
            >
              {filter === 'all' ? 'All Transactions' : filter === 'spend' ? 'Spends' : 'Incomes'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {filteredTxns.length > 0 ? (
            filteredTxns.map((txn, index) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, delay: Math.min(index * 0.03, 0.2) }}
                className="bg-[#161c2a] rounded-xl p-3 border border-[#1e2638] flex items-center justify-between shadow-sm hover:border-[#242f45] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    txn.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {txn.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{txn.merchant}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-md font-medium">{txn.category}</span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(txn.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold font-mono ${
                    txn.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {txn.type === 'income' ? '+' : ''}{formatCurrency(txn.amount)}
                  </span>
                  <button
                    onClick={() => onDeleteTransaction(txn.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded-lg transition-all active:scale-95"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 bg-[#161c2a]/50 rounded-2xl border border-dashed border-[#1e2638] space-y-2">
              <p className="text-slate-400 text-xs font-medium">No transactions found</p>
              <p className="text-[10px] text-slate-500">Try adjustment or log a new transaction.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
