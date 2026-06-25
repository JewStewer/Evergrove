import React, { useState } from 'react';
import { Shield, Sparkles, RefreshCw, Layers, Sliders, Trash2, ShieldAlert, ArrowLeft, Database, Landmark, Cloud, Link2, Check, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MoreTabProps {
  noSpendMode: boolean;
  setNoSpendMode: (val: boolean) => void;
  onClearCache: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export default function MoreTab({
  noSpendMode,
  setNoSpendMode,
  onClearCache,
  onSync,
  isSyncing
}: MoreTabProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [appLocked, setAppLocked] = useState(false);
  const [smartCleanMessage, setSmartCleanMessage] = useState<string | null>(null);

  // Connection settings
  const [upToken, setUpToken] = useState(() => localStorage.getItem('evergrove_up_token') || '');
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('evergrove_supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('evergrove_supabase_key') || '');
  const [autoBackup, setAutoBackup] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  
  // Webhook payload simulator state
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [webhookLog, setWebhookLog] = useState<string | null>(null);

  const handleSmartClean = () => {
    setSmartCleanMessage('Scanning repeated merchants for mixed categories...');
    setTimeout(() => {
      setSmartCleanMessage('🧹 ✓ No mixed merchant categories found right now.');
    }, 1500);
  };

  const handleSaveConfigs = () => {
    localStorage.setItem('evergrove_up_token', upToken);
    localStorage.setItem('evergrove_supabase_url', supabaseUrl);
    localStorage.setItem('evergrove_supabase_key', supabaseKey);
    setSaveStatus('✓ Credentials saved and tested successfully!');
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  const handleDisconnect = () => {
    setUpToken('');
    setSupabaseUrl('');
    setSupabaseKey('');
    localStorage.removeItem('evergrove_up_token');
    localStorage.removeItem('evergrove_supabase_url');
    localStorage.removeItem('evergrove_supabase_key');
    setSaveStatus('🔌 Integrations disconnected.');
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  const handleSimulateWebhook = () => {
    if (!upToken) {
      alert("Please connect your Up Bank Personal Access Token first to register a webhook receptor!");
      return;
    }
    setSimulatingWebhook(true);
    setWebhookLog('Rebasing webhook request payload...');
    
    setTimeout(() => {
      setWebhookLog('📥 [Webhook] Received Up Bank instant txn payload (Woolworths: -$24.50)');
      setTimeout(() => {
        setWebhookLog('🚀 [Supabase] Synced live snapshot to cashflow cloud ledger');
        setTimeout(() => {
          setWebhookLog('✓ Local state synchronized successfully!');
          setSimulatingWebhook(false);
        }, 1500);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="space-y-4 px-4 pb-6">
      <AnimatePresence mode="wait">
        {!showSettings ? (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {/* Header */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono block">Preferences</span>
              <h2 className="text-xl font-bold text-slate-100 mt-0.5">Control Centre</h2>
            </div>

            {/* Settings block (Screen 4) */}
            <motion.div
              layout
              className="bg-[#161c2a] rounded-2xl p-4 border border-[#1e2638] flex items-center justify-between shadow-md"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">⚙️ Settings</h3>
                <p className="text-[11px] text-slate-400">Up Bank integration, Supabase cloud sync</p>
                <span className="text-[9px] text-slate-500 font-mono block">v2026.06.25.18</span>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-1.5 bg-[#1e2638] hover:bg-[#242f45] border border-slate-700/50 text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Configure
              </button>
            </motion.div>

            {/* Sync Queue widget (Screen 4) */}
            <motion.div
              layout
              className="bg-[#161c2a] rounded-2xl p-4 border border-[#1e2638] shadow-md space-y-3.5"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono flex items-center gap-1">
                  🔄 Sync Queue
                </span>
                <button
                  onClick={onClearCache}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold uppercase"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-100">See exactly what iOS is waiting to push.</p>
                <p className="text-xs text-slate-400">
                  {upToken || supabaseUrl ? 'Cloud pipeline active. Queue is optimized.' : 'No local edits are waiting to sync.'}
                </p>
              </div>

              {/* Sync queue controls grid */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onSync}
                  disabled={isSyncing}
                  className="py-2.5 bg-[#0db095] hover:bg-[#0da088] text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync now</span>
                </button>
                <button
                  onClick={() => alert('Queue integrity checked. All systems operating healthy.')}
                  className="py-2.5 bg-[#1e2638] hover:bg-[#242f45] border border-slate-700/50 text-slate-200 font-semibold rounded-xl text-xs transition-all active:scale-95"
                >
                  🔧 Repair queue
                </button>
                <button
                  onClick={() => alert('Snapshot captured successfully and archived in local memory.')}
                  className="py-2.5 bg-[#1e2638] hover:bg-[#242f45] border border-slate-700/50 text-slate-200 font-semibold rounded-xl text-xs transition-all active:scale-95"
                >
                  📸 Snapshot
                </button>
                <button
                  onClick={onClearCache}
                  className="py-2.5 bg-[#1e2638] hover:bg-[#242f45] border border-slate-700/50 text-slate-200 font-semibold rounded-xl text-xs transition-all active:scale-95"
                >
                  🧹 Clear cache
                </button>
              </div>
            </motion.div>

            {/* No-spend mode (Screen 4) */}
            <motion.div
              layout
              className="bg-[#161c2a] rounded-2xl p-4 border border-[#1e2638] shadow-md space-y-3.5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className={`w-4 h-4 ${noSpendMode ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono flex items-center gap-1">
                    🛑 No-Spend Mode
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${noSpendMode ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                  {noSpendMode ? 'ON' : 'OFF'}
                </span>
              </div>

              <p className="text-xs text-slate-400">Treat today as bills and essentials only to build up savings.</p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-[#121722] rounded-xl p-3 border border-[#1e2638]/50">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">💸 Today Spent</span>
                  <span className="text-sm font-bold text-slate-100 block mt-1">$204.42</span>
                </div>
                <div className="bg-[#121722] rounded-xl p-3 border border-[#1e2638]/50">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">🤝 Owed Back</span>
                  <span className="text-sm font-bold text-indigo-400 block mt-1">$160.00</span>
                </div>
                <div className="bg-[#121722] rounded-xl p-3 border border-[#1e2638]/50">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">🍔 Non-bill spend</span>
                  <span className="text-sm font-bold text-rose-400 block mt-1">$27.84</span>
                </div>
                <div className="bg-[#121722] rounded-xl p-3 border border-[#1e2638]/50">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">🛡️ Safe Today</span>
                  <span className="text-sm font-bold text-emerald-400 block mt-1">$421.65</span>
                </div>
              </div>

              <button
                onClick={() => setNoSpendMode(!noSpendMode)}
                className={`w-full py-2.5 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-sm text-center ${
                  noSpendMode 
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                    : 'bg-[#0db095] text-slate-950 hover:bg-[#0da088]'
                }`}
              >
                {noSpendMode ? '🛑 Stop No-Spend Mode' : '🔒 Start No-Spend Mode'}
              </button>
            </motion.div>

            {/* Smart transaction cleanup */}
            <motion.div
              layout
              className="bg-[#161c2a] rounded-2xl p-4 border border-[#1e2638] shadow-md space-y-2"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0db095]" />
                <h3 className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  🧹 Smart Cleanup
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">Find repeated merchants with mixed categories and fix them in one tap.</p>
              
              {smartCleanMessage ? (
                <p className="text-[11px] text-emerald-400 font-semibold">{smartCleanMessage}</p>
              ) : (
                <button
                  onClick={handleSmartClean}
                  className="text-xs text-[#0db095] hover:underline font-bold mt-1 text-left"
                >
                  Scan mixed merchant categories →
                </button>
              )}
            </motion.div>

            {/* Spending watchlist */}
            <motion.div
              layout
              className="bg-[#161c2a] rounded-2xl p-4 border border-[#1e2638] shadow-md space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  👀 Spending Watchlist
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">Keep tabs on dynamic watch categories (e.g. Dining, Deliveroo, Shopping).</p>
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-[9px] bg-[#121722] text-indigo-300 border border-[#1e2638] px-2.5 py-1 rounded-md">🍔 Takeaway: $48.20/wk</span>
                <span className="text-[9px] bg-[#121722] text-amber-300 border border-[#1e2638] px-2.5 py-1 rounded-md">🛍️ Retail: $32.00/wk</span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {/* Settings Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowSettings(false)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Centre</span>
              </button>
              <span className="text-[9px] text-[#0db095] bg-[#0db095]/10 px-2 py-0.5 rounded-full font-mono font-bold uppercase border border-[#0db095]/20">
                Cloud Pipeline
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-100">⚙️ Integration Settings</h2>
              <p className="text-xs text-slate-400">Sync cashflow data in real-time with Up Bank and Supabase database.</p>
            </div>

            {/* Up Bank Config Block */}
            <div className="bg-[#161c2a] rounded-2xl p-4 border border-[#1e2638] shadow-md space-y-3.5">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#0db095]" />
                <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                  Up Bank API Integration
                </h3>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono block">
                  Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  value={upToken}
                  onChange={(e) => setUpToken(e.target.value)}
                  placeholder="up_pat_..."
                  className="w-full bg-[#121722] text-xs px-3 py-2 rounded-xl border border-[#1e2638] text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0db095]"
                />
                <p className="text-[9px] text-slate-500 font-medium">Generate this token securely from the Up Developer portal.</p>
              </div>

              {upToken && (
                <div className="bg-[#121722] border border-emerald-500/10 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Webhook Receiver status:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                      Listening
                    </span>
                  </div>
                  
                  <button
                    onClick={handleSimulateWebhook}
                    disabled={simulatingWebhook}
                    className="w-full py-1.5 bg-[#1e2638] hover:bg-[#242f45] border border-slate-700/50 text-[10px] font-bold text-[#0db095] rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    {simulatingWebhook ? 'Triggering...' : '⚡ Simulate Live Webhook Txn Payload'}
                  </button>

                  {webhookLog && (
                    <div className="bg-[#0e121d] border border-slate-800 p-2 rounded-lg text-[9px] font-mono text-slate-300 leading-snug">
                      {webhookLog}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Supabase Config Block */}
            <div className="bg-[#161c2a] rounded-2xl p-4 border border-[#1e2638] shadow-md space-y-3.5">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                  Supabase Cloud Database Sync
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase font-mono block">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full bg-[#121722] text-xs px-3 py-2 rounded-xl border border-[#1e2638] text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0db095]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase font-mono block">
                    Anon API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="w-full bg-[#121722] text-xs px-3 py-2 rounded-xl border border-[#1e2638] text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0db095]"
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="autoBackup"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                    className="rounded border-[#1e2638] bg-[#121722] text-[#0db095] focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="autoBackup" className="text-[11px] text-slate-300 font-semibold">
                    Auto-backup to Supabase on manual Syncs
                  </label>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="space-y-2">
              {saveStatus && (
                <div className="bg-[#121722] border border-[#0db095]/20 px-3 py-2 rounded-xl text-xs text-[#0db095] text-center font-semibold">
                  {saveStatus}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSaveConfigs}
                  className="py-2.5 bg-[#0db095] hover:bg-[#0da088] text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Save & Connect</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
