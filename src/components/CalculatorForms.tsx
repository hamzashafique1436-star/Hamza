/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Percent, DollarSign, RefreshCw, Save, ArrowDownRight, 
  ArrowUpRight, Landmark, Coins, TrendingUp, HelpCircle 
} from 'lucide-react';
import { 
  calculatePositionSize, calculateRiskReward, calculatePnl, 
  calculateLeverage, calculateCompounding, calculatePips, calculateCryptoFees,
  PositionSizeResult, RiskRewardResult, PnlResult, LeverageResult, CompoundingResult,
  PipCalculatorResult, CryptoFeeResult
} from '../utils/calculations';

interface FormsProps {
  activeTab: string;
  onUpdateChartValues: (values: {
    entryPrice: number;
    stopLossPrice: number;
    takeProfitPrice: number;
    compoundingPeriods: any[];
    startBalance: number;
    pnlIsLong?: boolean;
    pnlBuyPrice?: number;
    pnlSellPrice?: number;
  }) => void;
  onSaveRecord: (type: string, title: string, inputs: any, outputs: any) => void;
}

export default function CalculatorForms({ activeTab, onUpdateChartValues, onSaveRecord }: FormsProps) {
  return (
    <div className="flex-1 flex flex-col gap-6">
      {activeTab === 'position-size' && <PositionSizeForm onUpdateChartValues={onUpdateChartValues} onSaveRecord={onSaveRecord} />}
      {activeTab === 'risk-reward' && <RiskRewardForm onUpdateChartValues={onUpdateChartValues} onSaveRecord={onSaveRecord} />}
      {activeTab === 'pnl' && <PnlForm onUpdateChartValues={onUpdateChartValues} onSaveRecord={onSaveRecord} />}
      {activeTab === 'leverage' && <LeverageForm onUpdateChartValues={onUpdateChartValues} onSaveRecord={onSaveRecord} />}
      {activeTab === 'compounding' && <CompoundingForm onUpdateChartValues={onUpdateChartValues} onSaveRecord={onSaveRecord} />}
      {activeTab === 'pip' && <PipCalculatorForm onUpdateChartValues={onUpdateChartValues} onSaveRecord={onSaveRecord} />}
      {activeTab === 'crypto-fee' && <CryptoFeeForm onUpdateChartValues={onUpdateChartValues} onSaveRecord={onSaveRecord} />}
    </div>
  );
}

// 1. POSITION SIZE CALCULATOR
function PositionSizeForm({ onUpdateChartValues, onSaveRecord }: any) {
  const [balance, setBalance] = useState<number>(10000);
  const [riskPct, setRiskPct] = useState<number>(1);
  const [entryPrice, setEntryPrice] = useState<number>(100);
  const [stopLossPrice, setStopLossPrice] = useState<number>(95);

  const [results, setResults] = useState<PositionSizeResult>({
    riskAmount: 0,
    positionSize: 0,
    maxLoss: 0,
    notionalValue: 0
  });

  const runCalculation = () => {
    const res = calculatePositionSize(balance, riskPct, entryPrice, stopLossPrice);
    setResults(res);
    onUpdateChartValues({
      entryPrice,
      stopLossPrice,
      takeProfitPrice: entryPrice + (entryPrice - stopLossPrice) * 2, // default 1:2 visual preview
      compoundingPeriods: [],
      startBalance: balance
    });
  };

  useEffect(() => {
    runCalculation();
  }, [balance, riskPct, entryPrice, stopLossPrice]);

  const handleReset = () => {
    setBalance(10000);
    setRiskPct(1);
    setEntryPrice(100);
    setStopLossPrice(95);
  };

  const handleSave = () => {
    onSaveRecord(
      'position-size',
      `Position Size Calculation (${entryPrice} to ${stopLossPrice})`,
      { balance, riskPct, entryPrice, stopLossPrice },
      results
    );
  };

  return (
    <div className="bg-[#111114] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Position Size Calculator
          </h3>
          <button onClick={handleReset} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#18181B] transition" title="Reset">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Account Balance ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="number" 
                value={balance || ''} 
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-805 border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono transition" 
                placeholder="10000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Risk Level (%)</label>
            <div className="relative">
              <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="number" 
                step="0.1"
                value={riskPct || ''} 
                onChange={(e) => setRiskPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono transition" 
                placeholder="1"
              />
            </div>
            {/* Quick Presets */}
            <div className="flex gap-1.5 mt-1.5 pt-0.5">
              {[0.5, 1, 2, 5].map((preset) => (
                <button 
                  key={preset}
                  onClick={() => setRiskPct(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition ${riskPct === preset ? 'bg-emerald-500 text-black font-extrabold' : 'bg-[#18181B] text-slate-400 hover:bg-slate-800'}`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Entry Price ($)</label>
            <input 
              type="number" 
              step="any"
              value={entryPrice || ''} 
              onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="100.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Stop Loss Price ($)</label>
            <input 
              type="number" 
              step="any"
              value={stopLossPrice || ''} 
              onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="95.00"
            />
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#18181B]/50 rounded-xl p-4 border border-slate-800/60 mb-4 h-full">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Risk Budget</span>
            <span className="text-base font-black font-mono text-rose-400">
              ${results.riskAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Position Size</span>
            <span className="text-base font-black font-mono text-emerald-400">
              {results.positionSize.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Max Loss Cap</span>
            <span className="text-base font-black font-mono text-rose-500">
              ${results.maxLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Notional Cost</span>
            <span className="text-base font-black font-mono text-slate-300">
              ${results.notionalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-605 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-500/20 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save Trade calculation
        </button>
      </div>
    </div>
  );
}

// 2. RISK TO REWARD CALCULATOR
function RiskRewardForm({ onUpdateChartValues, onSaveRecord }: any) {
  const [entryPrice, setEntryPrice] = useState<number>(100);
  const [stopLoss, setStopLoss] = useState<number>(95);
  const [takeProfit, setTakeProfit] = useState<number>(115);

  const [results, setResults] = useState<RiskRewardResult>({
    riskDistance: 0,
    rewardDistance: 0,
    ratio: 0,
    ratioText: "1:0",
    gainPercent: 0,
    lossPercent: 0
  });

  const runCalculation = () => {
    const res = calculateRiskReward(entryPrice, stopLoss, takeProfit);
    setResults(res);
    onUpdateChartValues({
      entryPrice,
      stopLossPrice: stopLoss,
      takeProfitPrice: takeProfit,
      compoundingPeriods: [],
      startBalance: 0
    });
  };

  useEffect(() => {
    runCalculation();
  }, [entryPrice, stopLoss, takeProfit]);

  const handleReset = () => {
    setEntryPrice(100);
    setStopLoss(95);
    setTakeProfit(115);
  };

  const handleSave = () => {
    onSaveRecord(
      'risk-reward',
      `Risk/Reward Setup (${entryPrice} to ${takeProfit})`,
      { entryPrice, stopLoss, takeProfit },
      results
    );
  };

  return (
    <div className="bg-[#111114] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            Risk to Reward Calculator
          </h3>
          <button onClick={handleReset} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#18181B] transition" title="Reset">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Entry Price ($)</label>
            <input 
              type="number" 
              step="any"
              value={entryPrice || ''} 
              onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="100.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-rose-400 block uppercase tracking-wider">Stop Loss ($)</label>
            <input 
              type="number" 
              step="any"
              value={stopLoss || ''} 
              onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-rose-950/40 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-2.5 px-4 text-sm font-mono transition animate-pulse-subtle" 
              placeholder="95.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-emerald-400 block uppercase tracking-wider">Take Profit ($)</label>
            <input 
              type="number" 
              step="any"
              value={takeProfit || ''} 
              onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-emerald-950/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="115.00"
            />
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 bg-[#18181B]/50 rounded-xl p-4 border border-slate-800/60 mb-4">
          <div className="space-y-1 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/20">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">R:R Ratio</span>
            <span className="text-base font-black font-mono text-emerald-400">
              {results.ratioText}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Potential Gain</span>
            <span className="text-base font-black font-mono text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              {results.gainPercent.toFixed(2)}%
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Potential Risk</span>
            <span className="text-base font-black font-mono text-rose-500 flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" />
              {results.lossPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-500/20 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save Risk Setup
        </button>
      </div>
    </div>
  );
}

// 3. PROFIT & LOSS CALCULATOR
function PnlForm({ onUpdateChartValues, onSaveRecord }: any) {
  const [buyPrice, setBuyPrice] = useState<number>(100);
  const [sellPrice, setSellPrice] = useState<number>(120);
  const [quantity, setQuantity] = useState<number>(10);
  const [isLong, setIsLong] = useState<boolean>(true);
  const [feePercent, setFeePercent] = useState<number>(0.1);

  const [results, setResults] = useState<PnlResult>({
    grossPnl: 0,
    netPnl: 0,
    pctChange: 0,
    totalFees: 0
  });

  const runCalculation = () => {
    const res = calculatePnl(buyPrice, sellPrice, quantity, isLong, feePercent);
    setResults(res);
    onUpdateChartValues({
      entryPrice: buyPrice,
      stopLossPrice: isLong ? buyPrice * 0.9 : sellPrice,
      takeProfitPrice: isLong ? sellPrice : buyPrice * 1.1,
      compoundingPeriods: [],
      startBalance: 0,
      pnlIsLong: isLong,
      pnlBuyPrice: buyPrice,
      pnlSellPrice: sellPrice
    });
  };

  useEffect(() => {
    runCalculation();
  }, [buyPrice, sellPrice, quantity, isLong, feePercent]);

  const handleReset = () => {
    setBuyPrice(100);
    setSellPrice(120);
    setQuantity(10);
    setIsLong(true);
    setFeePercent(0.1);
  };

  const handleSave = () => {
    onSaveRecord(
      'pnl',
      `${isLong ? 'Long' : 'Short'} P&L Trade (${quantity} units)`,
      { buyPrice, sellPrice, quantity, isLong, feePercent },
      results
    );
  };

  return (
    <div className="bg-[#111114] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Profit & Loss Calculator
          </h3>
          <div className="flex bg-[#18181B] p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setIsLong(true)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition uppercase tracking-wider ${isLong ? 'bg-emerald-600 text-black font-extrabold' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Long
            </button>
            <button 
              onClick={() => setIsLong(false)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition uppercase tracking-wider ${!isLong ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Short
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Buy Price ($)</label>
            <input 
              type="number" 
              step="any"
              value={buyPrice || ''} 
              onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="100.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Sell Price ($)</label>
            <input 
              type="number" 
              step="any"
              value={sellPrice || ''} 
              onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="120.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Quantity</label>
            <input 
              type="number" 
              value={quantity || ''} 
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Exchanges Fees (%)</label>
            <div className="relative">
              <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="number" 
                step="0.01"
                value={feePercent || ''}
                onChange={(e) => setFeePercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono transition" 
                placeholder="0.10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#18181B]/50 rounded-xl p-4 border border-slate-800/60 mb-4 h-full">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Gross Profit</span>
            <span className={`text-base font-black font-mono ${results.grossPnl >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              ${results.grossPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Percent Move</span>
            <span className={`text-base font-black font-mono ${results.pctChange >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              {results.pctChange.toFixed(2)}%
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Trading Fees</span>
            <span className="text-base font-black font-mono text-slate-400">
              ${results.totalFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="space-y-1 bg-emerald-500/5 p-1.5 rounded-lg border border-emerald-500/20">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Net P&L</span>
            <span className={`text-base font-black font-mono ${results.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              ${results.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-500/20 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save Trade P&L Record
        </button>
      </div>
    </div>
  );
}

// 4. LEVERAGE CALCULATOR
function LeverageForm({ onUpdateChartValues, onSaveRecord }: any) {
  const [balance, setBalance] = useState<number>(5000);
  const [leverage, setLeverage] = useState<number>(10);
  const [tradeSize, setTradeSize] = useState<number>(20000);

  const [results, setResults] = useState<LeverageResult>({
    marginRequired: 0,
    leverageRatio: 0,
    freeMargin: 0,
    isOverLeveraged: false
  });

  const runCalculation = () => {
    const res = calculateLeverage(balance, leverage, tradeSize);
    setResults(res);
    onUpdateChartValues({
      entryPrice: 100,
      stopLossPrice: 0,
      takeProfitPrice: 0,
      compoundingPeriods: [],
      startBalance: balance
    });
  };

  useEffect(() => {
    runCalculation();
  }, [balance, leverage, tradeSize]);

  const handleReset = () => {
    setBalance(5000);
    setLeverage(10);
    setTradeSize(20000);
  };

  const handleSave = () => {
    onSaveRecord(
      'leverage',
      `Leverage Setup (${leverage}x leverage)`,
      { balance, leverage, tradeSize },
      results
    );
  };

  return (
    <div className="bg-[#111114] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-400" />
            Leverage Calculator
          </h3>
          <button onClick={handleReset} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#18181B] transition" title="Reset">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Account Balance ($)</label>
            <input 
              type="number" 
              value={balance || ''} 
              onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="5000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Position Trade Size ($)</label>
            <input 
              type="number" 
              value={tradeSize || ''} 
              onChange={(e) => setTradeSize(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="20000"
            />
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leverage Multiplying factor</label>
              <span className="text-sm font-black font-mono text-emerald-400">{leverage}x</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="125" 
              value={leverage} 
              onChange={(e) => setLeverage(parseInt(e.target.value) || 1)}
              className="w-full accent-emerald-500 h-1.5 bg-slate-850 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>1x (Spot)</span>
              <span>10x (Safe Margin)</span>
              <span>50x (High Risk)</span>
              <span>100x+ (Apex Speculation)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[#18181B]/50 rounded-xl p-4 border border-slate-800/60 mb-4 h-full">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Margin Needed</span>
            <span className="text-base font-black font-mono text-amber-400">
              ${results.marginRequired.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Leverage Used</span>
            <span className="text-base font-black font-mono text-emerald-400">
              {results.leverageRatio.toFixed(1)}x
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Free Margin left</span>
            <span className={`text-base font-black font-mono ${results.freeMargin >= 0 ? 'text-slate-300' : 'text-rose-500'}`}>
              ${results.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {results.isOverLeveraged && (
          <div className="mb-4 bg-rose-950/20 text-rose-400 border border-rose-800/40 text-xs px-3.5 py-2.5 rounded-lg font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0"></div>
            <span>Liquidation Warning! Margin required exceeds account balance. Please reduce your trade size or increase the leverage!</span>
          </div>
        )}

        <button 
          onClick={handleSave}
          className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-500/20 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save Leverage Analysis
        </button>
      </div>
    </div>
  );
}

// 5. COMPOUNDING CALCULATOR
function CompoundingForm({ onUpdateChartValues, onSaveRecord }: any) {
  const [startB, setStartB] = useState<number>(5000);
  const [growth, setGrowth] = useState<number>(5);
  const [periods, setPeriods] = useState<number>(12);
  const [reinvest, setReinvest] = useState<number>(100);

  const [results, setResults] = useState<CompoundingResult>({
    finalBalance: 0,
    totalProfit: 0,
    totalGrowthPercent: 0,
    periods: []
  });

  const runCalculation = () => {
    const res = calculateCompounding(startB, growth, periods, reinvest);
    setResults(res);
    onUpdateChartValues({
      entryPrice: 0,
      stopLossPrice: 0,
      takeProfitPrice: 0,
      compoundingPeriods: res.periods,
      startBalance: startB
    });
  };

  useEffect(() => {
    runCalculation();
  }, [startB, growth, periods, reinvest]);

  const handleReset = () => {
    setStartB(5000);
    setGrowth(5);
    setPeriods(12);
    setReinvest(100);
  };

  const handleSave = () => {
    onSaveRecord(
      'compounding',
      `Compounding Growth (${periods} periods, ${growth}%)`,
      { startB, growth, periods, reinvest },
      results
    );
  };

  return (
    <div className="bg-[#111114] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Percent className="w-5 h-5 text-emerald-400" />
            Compounding Calculator
          </h3>
          <button onClick={handleReset} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#18181B] transition" title="Reset">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Starting Capital ($)</label>
            <input 
              type="number" 
              value={startB || ''} 
              onChange={(e) => setStartB(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="5000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Growth % per Period</label>
            <div className="relative">
              <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="number" 
                step="0.1"
                value={growth || ''} 
                onChange={(e) => setGrowth(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono transition" 
                placeholder="5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Compounding Periods</label>
            <input 
              type="number" 
              value={periods || ''} 
              onChange={(e) => setPeriods(parseInt(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="12"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Reinvest Rate (%)</label>
            <div className="relative">
              <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="number" 
                value={reinvest || ''} 
                onChange={(e) => setReinvest(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono transition" 
                placeholder="100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[#18181B]/50 rounded-xl p-4 border border-slate-800/60 mb-4 h-full">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Final Capital</span>
            <span className="text-base font-black font-mono text-emerald-400">
              ${results.finalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Total Net Profit</span>
            <span className="text-base font-black font-mono text-emerald-400 animate-pulse-subtle">
              ${results.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Total Accrued</span>
            <span className="text-base font-black font-mono text-slate-300">
              +{results.totalGrowthPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-500/20 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save Projections
        </button>
      </div>
    </div>
  );
}

// 6. PIP CALCULATOR
function PipCalculatorForm({ onUpdateChartValues, onSaveRecord }: any) {
  const [tradeSize, setTradeSize] = useState<number>(100000); // Lot equivalent unit
  const [lotCount, setLotCount] = useState<number>(1);
  const [pips, setPips] = useState<number>(10);
  const [useJpy, setUseJpy] = useState<boolean>(false);

  const [results, setResults] = useState<PipCalculatorResult>({
    pipValue: 0,
    totalValue: 0,
    pipAmountValue: 0
  });

  const runCalculation = () => {
    const res = calculatePips(useJpy ? 'USD/JPY' : 'EUR/USD', tradeSize, lotCount, pips, useJpy);
    setResults(res);
    onUpdateChartValues({
      entryPrice: useJpy ? 150 : 1.1,
      stopLossPrice: useJpy ? 149.5 : 1.095,
      takeProfitPrice: useJpy ? 151 : 1.11,
      compoundingPeriods: [],
      startBalance: 0
    });
  };

  useEffect(() => {
    runCalculation();
  }, [tradeSize, lotCount, pips, useJpy]);

  const handleReset = () => {
    setTradeSize(100000);
    setLotCount(1);
    setPips(10);
    setUseJpy(false);
  };

  const handleSave = () => {
    onSaveRecord(
      'pip',
      `PIP calculation (${pips} pips on ${useJpy ? 'JPY pair' : 'Standard pair'})`,
      { tradeSize, lotCount, pips, useJpy },
      results
    );
  };

  return (
    <div className="bg-[#111114] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            Forex Pip Calculator
          </h3>
          <div className="flex bg-[#18181B] p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setUseJpy(false)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition uppercase tracking-wider ${!useJpy ? 'bg-emerald-500 text-black font-extrabold' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Std Pair (4 Dec)
            </button>
            <button 
              onClick={() => setUseJpy(true)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition uppercase tracking-wider ${useJpy ? 'bg-emerald-500 text-black font-extrabold' : 'text-slate-500 hover:text-slate-300'}`}
            >
              JPY Pair (2 Dec)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Lot Unit Category</label>
            <select
              value={tradeSize}
              onChange={(e) => setTradeSize(parseInt(e.target.value))}
              className="w-full bg-[#18181B] text-slate-100 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition"
            >
              <option value="100000">Standard Lot (100,000 units)</option>
              <option value="10000">Mini Lot (10,000 units)</option>
              <option value="1000">Micro Lot (1,000 units)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Lot Count</label>
            <input 
              type="number" 
              step="0.01"
              value={lotCount || ''} 
              onChange={(e) => setLotCount(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="1"
            />
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Pip Amount</label>
            <input 
              type="number" 
              value={pips || ''} 
              onChange={(e) => setPips(parseInt(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="10"
            />
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[#18181B]/50 rounded-xl p-4 border border-slate-800/60 mb-4 h-full">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Value per Pip</span>
            <span className="text-base font-black font-mono text-emerald-400">
              ${results.pipValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Total PIP Margin</span>
            <span className="text-base font-black font-mono text-slate-300">
              ${results.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Pips Gain Amount</span>
            <span className="text-base font-black font-mono text-emerald-400">
              ${results.pipAmountValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-500/20 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save Pip setup
        </button>
      </div>
    </div>
  );
}

// 7. CRYPTO FEE CALCULATOR
function CryptoFeeForm({ onUpdateChartValues, onSaveRecord }: any) {
  const [price, setPrice] = useState<number>(65000);
  const [amount, setAmount] = useState<number>(0.5);
  const [makerFeeState, setMakerFeeState] = useState<number>(0.1);
  const [takerFeeState, setTakerFeeState] = useState<number>(0.2);

  const [results, setResults] = useState<CryptoFeeResult>({
    orderValue: 0,
    makerRate: 0,
    takerRate: 0,
    makerFee: 0,
    takerFee: 0,
    difference: 0
  });

  const runCalculation = () => {
    const res = calculateCryptoFees(price, amount, makerFeeState, takerFeeState);
    setResults(res);
    onUpdateChartValues({
      entryPrice: price,
      stopLossPrice: price * 0.95,
      takeProfitPrice: price * 1.05,
      compoundingPeriods: [],
      startBalance: 0
    });
  };

  useEffect(() => {
    runCalculation();
  }, [price, amount, makerFeeState, takerFeeState]);

  const handleReset = () => {
    setPrice(65000);
    setAmount(0.5);
    setMakerFeeState(0.1);
    setTakerFeeState(0.2);
  };

  const handleSave = () => {
    onSaveRecord(
      'crypto-fee',
      `Crypto Fee analysis (${amount} BTC at $${price})`,
      { price, amount, makerFeeState, takerFeeState },
      results
    );
  };

  return (
    <div className="bg-[#111114] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            Crypto Fee Calculator
          </h3>
          <button onClick={handleReset} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#18181B] transition" title="Reset">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Asset/Token Price ($)</label>
            <input 
              type="number" 
              value={price || ''} 
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="65000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Trade Amount / Qty</label>
            <input 
              type="number" 
              step="0.0001"
              value={amount || ''} 
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="0.5"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Exchange Maker Fee (%)</label>
            <input 
              type="number" 
              step="0.01"
              value={makerFeeState || ''} 
              onChange={(e) => setMakerFeeState(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="0.10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Exchange Taker Fee (%)</label>
            <input 
              type="number" 
              step="0.01"
              value={takerFeeState || ''} 
              onChange={(e) => setTakerFeeState(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#18181B] text-slate-100 placeholder-slate-600 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-sm font-mono transition" 
              placeholder="0.20"
            />
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#18181B]/50 rounded-xl p-4 border border-slate-800/60 mb-4 h-full">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Order Notional</span>
            <span className="text-base font-black font-mono text-slate-300">
              ${results.orderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Maker Fee</span>
            <span className="text-base font-black font-mono text-emerald-400 animate-pulse-subtle">
              ${results.makerFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Taker Fee</span>
            <span className="text-base font-black font-mono text-rose-400">
              ${results.takerFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="space-y-1 bg-emerald-500/5 p-1.5 rounded-lg border border-emerald-500/20">
            <span className="text-[10px] font-bold text-emerald-450 text-emerald-400 tracking-wider uppercase block">Est. Savings</span>
            <span className="text-base font-black font-mono text-emerald-400">
              ${results.difference.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-500/20 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save Fee Calculation
        </button>
      </div>
    </div>
  );
}
