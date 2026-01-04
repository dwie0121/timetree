import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Settings,
  ShieldCheck,
  AlertCircle,
  Database
} from 'lucide-react';
import { CalendarEvent } from '../types';

interface SettingsViewProps {
  events: CalendarEvent[];
}

const SettingsView: React.FC<SettingsViewProps> = ({ events }) => {
  const income = events
    .filter(e => e.transactionType === 'income' && e.amount)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    
  const expenses = events
    .filter(e => e.transactionType === 'expense' && e.amount)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const netIncome = income - expenses;
  
  // Robust check for configuration without crashing if import.meta.env is missing
  const isSupabaseConfigured = !!(
    (import.meta as any).env?.VITE_SUPABASE_URL || 
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL)
  );

  return (
    <div className="flex-1 overflow-y-auto bg-white lg:rounded-3xl border border-gray-100 shadow-inner p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center sm:text-left">Workspace Insights</h2>
          <p className="text-gray-500 text-center sm:text-left">Financial summary and production system configuration.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp size={80} className="text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Gross Income</span>
              <span className="text-3xl font-black text-emerald-900">₱{income.toLocaleString()}</span>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
                <ArrowUpRight size={14} />
                <span>Computed from events</span>
              </div>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingDown size={80} className="text-rose-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-widest mb-2">Total Expenses</span>
              <span className="text-3xl font-black text-rose-900">₱{expenses.toLocaleString()}</span>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-rose-600">
                <ArrowDownRight size={14} />
                <span>Computed from events</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-3xl relative overflow-hidden group shadow-xl shadow-indigo-200">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Wallet size={80} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-2">Net Balance</span>
              <span className="text-3xl font-black text-white">₱{netIncome.toLocaleString()}</span>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-100">
                <PieChart size={14} />
                <span>Final workspace balance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Status Panel */}
        <div className="mb-10 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-xl ${isSupabaseConfigured ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isSupabaseConfigured ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
              </div>
              <div>
                <h3 className="text-xl font-bold">Cloud Infrastructure</h3>
                <p className="text-slate-400 text-sm">Supabase Realtime Database status</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-indigo-400" />
                  <span className="text-sm font-bold">PostgreSQL Persistence</span>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {isSupabaseConfigured ? 'Connected' : 'Disconnected'}
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                To ensure your events are saved across devices, navigate to your platform settings (e.g. Vercel &gt; Environment Variables) and add:
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px]">
                  <span className="text-indigo-400">VITE_SUPABASE_URL</span>
                  <span className="text-slate-500 truncate ml-4">https://...supabase.co</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px]">
                  <span className="text-indigo-400">VITE_SUPABASE_ANON_KEY</span>
                  <span className="text-slate-500 truncate ml-4">eyJhbGciOiJIUzI1...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Settings size={20} className="text-gray-400" />
            Workspace Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div>
                <p className="font-bold text-gray-900">Currency</p>
                <p className="text-xs text-gray-500">Default currency for transactions</p>
              </div>
              <select className="bg-gray-50 border border-gray-100 text-sm font-bold px-4 py-2 rounded-xl outline-none focus:ring-2 ring-indigo-500/10">
                <option>PHP (₱)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;