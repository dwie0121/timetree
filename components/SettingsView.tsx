
import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Settings, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  Copy,
  Terminal
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
  const isApiKeyConfigured = !!process.env.API_KEY && process.env.API_KEY !== 'undefined';

  const copyEnvKey = () => {
    navigator.clipboard.writeText('API_KEY');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white lg:rounded-3xl border border-gray-100 shadow-inner p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Workspace Insights</h2>
          <p className="text-gray-500">Financial summary and system configuration.</p>
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

        {/* Vercel Setup Guide */}
        <div className="mb-10 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Terminal size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-xl ${isApiKeyConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isApiKeyConfigured ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
              </div>
              <div>
                <h3 className="text-xl font-bold">Vercel Deployment Guide</h3>
                <p className="text-slate-400 text-sm">Configure your Gemini API key for production</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  To enable "Magic Create" features in production, you must set your API key in the Vercel Dashboard.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                    <div className="text-sm">
                      <p className="font-bold text-white">Open Vercel Dashboard</p>
                      <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 font-medium transition-colors">
                        Go to Project Settings <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                    <div className="text-sm">
                      <p className="font-bold text-white">Add Environment Variable</p>
                      <p className="text-slate-400 mt-1">Navigate to <b>Settings {'>'} Environment Variables</b> and add the following:</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="bg-slate-950 px-4 py-2 rounded-lg font-mono text-xs text-indigo-400 border border-slate-700 flex items-center gap-3 group">
                          API_KEY
                          <button onClick={copyEnvKey} className="text-slate-500 hover:text-white transition-colors">
                            <Copy size={14} />
                          </button>
                        </div>
                        <span className="text-slate-500 text-xs">Value: [Your Gemini Key]</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                    <div className="text-sm">
                      <p className="font-bold text-white">Redeploy</p>
                      <p className="text-slate-400 mt-1">Trigger a new deployment for changes to take effect.</p>
                    </div>
                  </div>
                </div>
              </div>

              {!isApiKeyConfigured && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-200 text-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  <p>AI Features are currently disabled because <b>API_KEY</b> is not set.</p>
                </div>
              )}
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
            <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div>
                <p className="font-bold text-gray-900">Financial Notifications</p>
                <p className="text-xs text-gray-500">Receive alerts for budget changes</p>
              </div>
              <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
