/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import TradingChart from './components/TradingChart';
import CalculatorForms from './components/CalculatorForms';
import HistorySidebar from './components/HistorySidebar';
import { HistoryRecord } from './types';
import { 
  PlusCircle, ShieldCheck, TrendingUp, DollarSign, Key, Zap, CheckCircle 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('position-size');
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // State values for chart synchronization
  const [chartValues, setChartValues] = useState<{
    entryPrice: number;
    stopLossPrice: number;
    takeProfitPrice: number;
    compoundingPeriods: any[];
    startBalance: number;
    pnlIsLong?: boolean;
    pnlBuyPrice?: number;
    pnlSellPrice?: number;
  }>({
    entryPrice: 100,
    stopLossPrice: 95,
    takeProfitPrice: 115,
    compoundingPeriods: [],
    startBalance: 10000,
    pnlIsLong: true,
    pnlBuyPrice: 100,
    pnlSellPrice: 120
  });

  // Load history from local storage of client
  useEffect(() => {
    const saved = localStorage.getItem('trading_calc_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse history logs", err);
      }
    }
  }, []);

  // Save record callback
  const handleSaveRecord = (type: string, title: string, inputs: any, outputs: any) => {
    const newRecord: HistoryRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: type as any,
      title,
      timestamp: new Date().toISOString(),
      inputs,
      outputs
    };

    const updated = [newRecord, ...history];
    setHistory(updated);
    localStorage.setItem('trading_calc_history', JSON.stringify(updated));
  };

  // Delete individual record
  const handleDeleteRecord = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('trading_calc_history', JSON.stringify(updated));
  };

  // Clear entire history
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your saved trade setups? This action is permanent.")) {
      setHistory([]);
      localStorage.removeItem('trading_calc_history');
    }
  };

  // Select historical record (Pre-populate active tab calculator inputs!)
  const handleSelectRecord = (record: HistoryRecord) => {
    setActiveTab(record.type);
    
    // Auto-update values in visual price map charts
    const ins = record.inputs;
    if (record.type === 'position-size') {
      setChartValues({
        entryPrice: Number(ins.entryPrice) || 0,
        stopLossPrice: Number(ins.stopLossPrice) || 0,
        takeProfitPrice: (Number(ins.entryPrice) || 0) + ((Number(ins.entryPrice) || 0) - (Number(ins.stopLossPrice) || 0)) * 2,
        compoundingPeriods: [],
        startBalance: Number(ins.balance) || 0
      });
    } else if (record.type === 'risk-reward') {
      setChartValues({
        entryPrice: Number(ins.entryPrice) || 0,
        stopLossPrice: Number(ins.stopLoss) || 0,
        takeProfitPrice: Number(ins.takeProfit) || 0,
        compoundingPeriods: [],
        startBalance: 0
      });
    } else if (record.type === 'pnl') {
      setChartValues({
        entryPrice: Number(ins.buyPrice) || 0,
        stopLossPrice: ins.isLong ? (Number(ins.buyPrice) || 0) * 0.9 : (Number(ins.sellPrice) || 0),
        takeProfitPrice: ins.isLong ? (Number(ins.sellPrice) || 0) : (Number(ins.buyPrice) || 0) * 1.1,
        compoundingPeriods: [],
        startBalance: 0,
        pnlIsLong: ins.isLong,
        pnlBuyPrice: Number(ins.buyPrice) || 0,
        pnlSellPrice: Number(ins.sellPrice) || 0
      });
    } else if (record.type === 'leverage') {
      setChartValues({
        entryPrice: 100,
        stopLossPrice: 0,
        takeProfitPrice: 0,
        compoundingPeriods: [],
        startBalance: Number(ins.balance) || 0
      });
    } else if (record.type === 'compounding') {
      // Re-map the compounding periods outputs
      setChartValues({
        entryPrice: 0,
        stopLossPrice: 0,
        takeProfitPrice: 0,
        compoundingPeriods: (record.outputs as any).periods || [],
        startBalance: Number(ins.startB) || 0
      });
    } else if (record.type === 'pip') {
      setChartValues({
        entryPrice: ins.useJpy ? 150 : 1.1,
        stopLossPrice: ins.useJpy ? 149.5 : 1.095,
        takeProfitPrice: ins.useJpy ? 151 : 1.11,
        compoundingPeriods: [],
        startBalance: 0
      });
    } else if (record.type === 'crypto-fee') {
      setChartValues({
        entryPrice: Number(ins.price) || 0,
        stopLossPrice: (Number(ins.price) || 0) * 0.95,
        takeProfitPrice: (Number(ins.price) || 0) * 1.05,
        compoundingPeriods: [],
        startBalance: 0
      });
    }

    // Trigger standard alert to notify user
    alert(`Loaded inputs into ${record.title}. Your values have been successfully restored!`);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-200 flex flex-col font-sans select-none overflow-hidden print:bg-white print:text-slate-950">
      {/* Header with tickers */}
      <Header />

      {/* Tilted neon ambient aura behind the layout */}
      <div className="absolute top-24 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-16 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Tabs navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Core Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 overflow-y-auto print:p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-full">
          
          {/* Active Forms Inputs Card */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <CalculatorForms 
              activeTab={activeTab}
              onUpdateChartValues={setChartValues}
              onSaveRecord={handleSaveRecord}
            />
          </div>

          {/* Interactive visual displays columns */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Real-time map/curves display card */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 font-mono">Live Projections</span>
              <TradingChart 
                activeTab={activeTab}
                entryPrice={chartValues.entryPrice}
                stopLossPrice={chartValues.stopLossPrice}
                takeProfitPrice={chartValues.takeProfitPrice}
                compoundingPeriods={chartValues.compoundingPeriods}
                startBalance={chartValues.startBalance}
                pnlIsLong={chartValues.pnlIsLong}
                pnlBuyPrice={chartValues.pnlBuyPrice}
                pnlSellPrice={chartValues.pnlSellPrice}
              />
            </div>

            {/* Offline Local history setup log */}
            <div className="flex-1 flex flex-col justify-between">
              <HistorySidebar 
                records={history}
                onClearHistory={handleClearHistory}
                onDeleteRecord={handleDeleteRecord}
                onSelectRecord={handleSelectRecord}
              />
            </div>
          </div>

        </div>

        {/* Informative Stats & Guidelines Footer row */}
        <div className="mt-8 pt-5 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-3 gap-5 text-slate-500 text-xs text-center md:text-left">
          <div className="space-y-1">
            <span className="text-slate-300 font-bold block flex items-center justify-center md:justify-start gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Beginner Friendly Math
            </span>
            <p className="text-[11px] leading-relaxed">Each tool explains standard margins, contracts sizes, leverage layers, and reinvestment points for healthy risk controls.</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-300 font-bold block flex items-center justify-center md:justify-start gap-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              Instant Calculations
            </span>
            <p className="text-[11px] leading-relaxed">No submit buttons required. Calculations re-compile automatically with zero-delay as you fine-tune positions.</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-300 font-bold block flex items-center justify-center md:justify-start gap-1">
              <CheckCircle className="w-4 h-4 text-indigo-400" />
              Pragmatic Local Sync
            </span>
            <p className="text-[11px] leading-relaxed">All active setups and log histories compile client-side to keep proprietary setups 100% private and offline.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
