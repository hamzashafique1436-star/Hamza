/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Layers, Sparkles, BookOpen, Clock } from 'lucide-react';
import { MarketTicker } from '../types';

interface HeaderProps {
  onRefreshTickers?: () => void;
}

export default function Header({ onRefreshTickers }: HeaderProps) {
  const [tickers, setTickers] = useState<MarketTicker[]>([
    { symbol: 'BTC/USD', name: 'Bitcoin', price: 68420.50, change: 1.42 },
    { symbol: 'ETH/USD', name: 'Ethereum', price: 3422.15, change: -0.85 },
    { symbol: 'EUR/USD', name: 'Euro Dollar', price: 1.0845, change: 0.12 },
    { symbol: 'GBP/USD', name: 'Pound Dollar', price: 1.2582, change: 0.23 },
    { symbol: 'USD/JPY', name: 'Dollar Yen', price: 151.72, change: -0.05 },
  ]);

  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Simulation tick for real-time live trading vibes
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString());
    };
    updateTime();

    const interval = setInterval(() => {
      setTickers(prev => prev.map(t => {
        // slight price flicker
        const percent = (Math.random() * 0.15 - 0.075);
        const priceDiff = t.price * (percent / 100);
        const newPrice = t.price + priceDiff;
        const newChange = t.change + (percent * 0.2);
        
        return {
          ...t,
          price: parseFloat(newPrice.toFixed(t.symbol.includes('JPY') ? 2 : t.symbol.includes('USD') && !t.symbol.includes('/') ? 2 : t.symbol === 'EUR/USD' || t.symbol === 'GBP/USD' ? 4 : 2)),
          change: parseFloat(newChange.toFixed(2))
        };
      }));
      updateTime();
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#111114] border-b border-slate-800/80 px-6 py-4.5 shrink-0 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand visual layout with literal naming */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Layers className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight text-white uppercase font-sans">
                TRADE<span className="text-emerald-400">QUANT</span>
              </h1>
              <span className="hidden sm:inline bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Pro Suite</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Instantly analyze your sizes, margins, reward levels, and compounding curves.</p>
          </div>
        </div>

        {/* Dynamic tickers feed */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          <div className="hidden lg:flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider mr-2 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            Live Feeds ({lastUpdated}):
          </div>

          <div className="flex items-center gap-3">
            {tickers.map((t) => {
              const sign = t.change >= 0 ? '+' : '';
              const isUp = t.change >= 0;
              return (
                <div 
                  key={t.symbol} 
                  className="bg-[#18181B] border border-slate-800/80 rounded-xl px-3 py-1.5 flex flex-col justify-between shrink-0 hover:border-slate-700/80 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-extrabold text-slate-400 font-mono">{t.symbol}</span>
                    <span className={`text-[9px] font-black font-mono flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {sign}{t.change}%
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-100 font-mono mt-0.5">
                    {t.symbol === 'EUR/USD' || t.symbol === 'GBP/USD' ? t.price.toFixed(4) : t.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
