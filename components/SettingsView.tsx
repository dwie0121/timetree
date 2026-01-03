
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
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

  return (
    <div className="flex-1 overflow-y-auto bg-white lg:rounded-3xl border border-gray-100 shadow-inner p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Financial Summary</h2>
          <p className="text-gray-500">Overview of income and expenses based on scheduled events.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Gross Income */}
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp size={80} className="text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Gross Income</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-900">${income.toLocaleString()}</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
                <ArrowUpRight size={14} />
                <span>Computed from events</span>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingDown size={80} className="text-rose-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-widest mb-2">Total Expenses</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-rose-900">${expenses.toLocaleString()}</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-rose-600">
                <ArrowDownRight size={14} />
                <span>Computed from events</span>
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div className="bg-blue-600 p-6 rounded-3xl relative overflow-hidden group shadow-xl shadow-blue-200">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Wallet size={80} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-2">Net Income</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">${netIncome.toLocaleString()}</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-100">
                <PieChart size={14} />
                <span>Final balance</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Settings size={20} className="text-gray-400" />
            Workspace Preferences
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Currency</p>
                <p className="text-xs text-gray-500">Default currency for all transactions</p>
              </div>
              <select className="bg-gray-50 border-none text-sm font-bold p-2 rounded-xl outline-none">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Notifications</p>
                <p className="text-xs text-gray-500">Receive alerts for financial updates</p>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Settings } from 'lucide-react';

export default SettingsView;
