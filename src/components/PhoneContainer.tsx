import React, { useState, useEffect } from 'react';
import { Home, ListOrdered, CalendarDays, HelpCircle, Landmark, MoreHorizontal, Wifi, Battery, Signal, ShieldCheck } from 'lucide-react';

interface PhoneContainerProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSyncing: boolean;
}

export default function PhoneContainer({ children, activeTab, setActiveTab, isSyncing }: PhoneContainerProps) {
  const [time, setTime] = useState('8:22');

  // Dynamic ticking time formatted as hours:minutes
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'txns', label: 'Txns', icon: ListOrdered },
    { id: 'bills', label: 'Bills', icon: CalendarDays },
    { id: 'budget', label: 'Budget', icon: ShieldCheck },
    { id: 'accounts', label: 'Accounts', icon: Landmark },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-[#0a0d16] text-slate-100 rounded-[50px] shadow-[0_0_0_12px_#1e293b,0_25px_50px_-12px_rgba(0,0,0,0.8)] border-4 border-[#0c101d] overflow-hidden flex flex-col relative aspect-[9/19.5] max-h-[880px]">
      {/* iOS Status Bar (Screen layout) */}
      <div className="h-11 bg-[#0a0d16] px-6 pt-3 flex items-center justify-between text-[11px] font-bold select-none shrink-0 z-20">
        {/* Clock */}
        <span className="text-slate-200 font-sans tracking-tight">{time}</span>

        {/* Dynamic Island / Notch */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-28 h-6 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800/40 shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 absolute right-4 border border-slate-800/50" />
        </div>

        {/* Status Icons */}
        <div className="flex items-center gap-1.5 text-slate-200">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1">
            <Battery className="w-4 h-4 text-slate-200" />
            <span className="text-[9px] font-bold font-sans">66%</span>
          </div>
        </div>
      </div>

      {/* Header Panel */}
      <div className="bg-[#0a0d16] border-b border-[#1e2638]/50 px-4 py-2 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          {/* Logo favicon dot */}
          <div className="w-5 h-5 bg-[#0db095]/10 border border-[#0db095]/40 rounded-md flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#0db095] shadow-[0_0_8px_#0db095]" />
          </div>
          <h1 className="text-base font-bold text-slate-100 tracking-tight font-sans">Evergrove</h1>
        </div>

        {/* Sync Indicator badge */}
        <span className={`text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${
          isSyncing ? 'bg-amber-500/10 text-amber-400 animate-pulse' : 'bg-emerald-500/10 text-emerald-400'
        }`}>
          {isSyncing ? 'syncing' : 'synced'}
        </span>
      </div>

      {/* App Body Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#0a0d16] pt-3 pb-24">
        {children}
      </div>

      {/* Navigation Tab Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-[#0e121d] border-t border-[#1e2638] px-3 pt-2.5 pb-6 flex justify-around items-center text-slate-400 z-20 select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
                isActive ? 'text-[#0db095]' : 'hover:text-slate-200 text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-bold font-sans tracking-wide">{item.label}</span>
            </button>
          );
        })}
        {/* iOS Home Indicator Bar */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-700/80 rounded-full" />
      </div>
    </div>
  );
}
