/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Calculator, DollarSign, Coins, TrendingUp, Landmark, Percent, Settings, ShieldCheck, Gem
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'position-size', name: 'Position Size', icon: DollarSign, color: 'text-indigo-400' },
    { id: 'risk-reward', name: 'Risk / Reward', icon: Coins, color: 'text-emerald-400' },
    { id: 'pnl', name: 'Profit & Loss', icon: TrendingUp, color: 'text-teal-400' },
    { id: 'leverage', name: 'Leverage', icon: Landmark, color: 'text-amber-500' },
    { id: 'compounding', name: 'Compounding', icon: Percent, color: 'text-sky-400' },
    { id: 'pip', name: 'Pip Calculator', icon: ShieldCheck, color: 'text-purple-400' },
    { id: 'crypto-fee', name: 'Crypto Fees', icon: Gem, color: 'text-orange-400' },
  ];

  return (
    <div className="bg-[#09090B] border-b border-slate-900/80 scrollbar-none px-6 py-2 select-none overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 md:gap-3 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold tracking-tight transition shrink-0 ${
                isActive 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#111114]'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
