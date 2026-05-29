/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, Percent, ChevronDown, Check, Star, Shield, HelpCircle } from 'lucide-react';
import { CompoundingPeriod } from '../utils/calculations';

interface TradingChartProps {
  activeTab: string;
  // Position size / Risk-reward values for the candles/lines
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  compoundingPeriods: CompoundingPeriod[];
  startBalance: number;
  // Optional forex or pnl params
  pnlIsLong?: boolean;
  pnlBuyPrice?: number;
  pnlSellPrice?: number;
}

export default function TradingChart({
  activeTab,
  entryPrice,
  stopLossPrice,
  takeProfitPrice,
  compoundingPeriods,
  startBalance,
  pnlIsLong = true,
  pnlBuyPrice = 0,
  pnlSellPrice = 0,
}: TradingChartProps) {
  const [timeframe, setTimeframe] = useState('1H');
  const [candles, setCandles] = useState<Array<{ x: number; open: number; high: number; low: number; close: number; isUp: boolean }>>([]);

  // Generate deterministic mock candle background for visual styling
  useEffect(() => {
    const list = [];
    let price = 100;
    // Generate 16 candles
    for (let i = 0; i < 20; i++) {
      const isUp = i === 0 ? true : Math.random() > 0.45;
      const change = (Math.random() * 3 + 0.2) * (isUp ? 1 : -1);
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * 1.5;
      const low = Math.min(open, close) - Math.random() * 1.5;
      
      list.push({
        x: i * 22 + 20,
        open,
        high,
        low,
        close,
        isUp: close >= open
      });
      price = close;
    }
    setCandles(list);
  }, [timeframe]);

  // Determine scale for Risk/Reward Setup Chart
  const isRiskRewardActive = activeTab === 'position-size' || activeTab === 'risk-reward' || activeTab === 'pip';
  const isPnlActive = activeTab === 'pnl' || activeTab === 'crypto-fee';
  
  // Custom compounding SVG graph parameters
  const renderCompoundingChart = () => {
    if (!compoundingPeriods || compoundingPeriods.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
          <TrendingUp className="w-12 h-12 mb-2 text-slate-600 animate-pulse" />
          <p className="text-sm">Enter compounding growth values to see projected curve</p>
        </div>
      );
    }

    const data = compoundingPeriods;
    const maxVal = Math.max(...data.map(p => p.endBalance)) * 1.05;
    const minVal = startBalance * 0.95;
    const range = maxVal - minVal;

    const width = 500;
    const height = 280;
    const paddingLeft = 65;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Build the SVG path
    const points = data.map((item, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((item.endBalance - minVal) / range) * chartHeight;
      return { x, y, val: item.endBalance, period: item.period };
    });

    const pathD = points.length > 0 
      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
      : '';

    // Area path closed to the bottom
    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length-1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
      : '';

    return (
      <div className="w-full h-full flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Growth Projection
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {data.length} periods compounding
          </span>
        </div>
        
        <div className="relative w-full overflow-hidden flex-1">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingTop + chartHeight * ratio;
              const val = maxVal - ratio * range;
              return (
                <g key={idx}>
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    className="stroke-slate-800" 
                    strokeWidth="1" 
                    strokeDasharray="4 4" 
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={y + 4} 
                    className="fill-slate-500 text-[10px] font-mono" 
                    textAnchor="end"
                  >
                    ${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </text>
                </g>
              );
            })}

            {/* Area under curve with gradient */}
            <defs>
              <linearGradient id="compoundingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.00"/>
              </linearGradient>
            </defs>
            {areaD && <path d={areaD} fill="url(#compoundingGrad)" />}

            {/* Line chart curve */}
            {pathD && (
              <path 
                d={pathD} 
                className="stroke-emerald-400" 
                strokeWidth="2.5" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}

            {/* Points on hover/always visible circles */}
            {points.map((p, i) => {
              // Highlight initial, midpoint, and final
              const isSignificant = i === 0 || i === Math.floor(points.length / 2) || i === points.length - 1;
              if (!isSignificant && points.length > 20) return null;
              
              return (
                <g key={i}>
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="4" 
                    className="fill-emerald-400 stroke-slate-950" 
                    strokeWidth="1.5" 
                  />
                  <text 
                    x={p.x} 
                    y={p.y - 10} 
                    className="fill-white text-[9px] font-mono text-center font-bold" 
                    textAnchor="middle"
                  >
                    P{p.period}
                  </text>
                </g>
              );
            })}

            {/* X Axis Labels */}
            {points.map((p, i) => {
              const isSignificant = i === 0 || i === Math.floor(points.length / 4) || i === Math.floor(points.length / 2) || i === Math.floor(points.length * 0.75) || i === points.length - 1;
              if (!isSignificant) return null;
              return (
                <text 
                  key={i}
                  x={p.x} 
                  y={height - 15} 
                  className="fill-slate-500 text-[10px] font-mono" 
                  textAnchor="middle"
                >
                  Per {p.period}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const renderTradingSetupChart = () => {
    // Values
    const entry = isRiskRewardActive ? entryPrice : pnlBuyPrice;
    const tp = isRiskRewardActive ? takeProfitPrice : (pnlIsLong ? pnlSellPrice : 0);
    const sl = isRiskRewardActive ? stopLossPrice : (pnlIsLong ? 0 : pnlSellPrice);

    // If inputs are empty or default, display standard layout
    if (!entry || entry <= 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4 text-center">
          <HelpCircle className="w-12 h-12 mb-2 text-slate-600 animate-pulse" />
          <h4 className="text-slate-300 font-medium mb-1">Interactive Price Map</h4>
          <p className="text-xs text-slate-500 max-w-xs">Enter your entry, stop-loss, and take profit prices to render the live visual reward-risk profile matrix.</p>
        </div>
      );
    }

    // Determine the boundaries of our chart
    let minPrice = entry;
    let maxPrice = entry;

    if (tp && tp > 0) {
      minPrice = Math.min(minPrice, tp);
      maxPrice = Math.max(maxPrice, tp);
    }
    if (sl && sl > 0) {
      minPrice = Math.min(minPrice, sl);
      maxPrice = Math.max(maxPrice, sl);
    }

    // Add 10% breathing room to the chart scale
    const margin = Math.abs(maxPrice - minPrice) * 0.15 || entry * 0.05;
    const finalMin = Math.max(0.01, minPrice - margin);
    const finalMax = maxPrice + margin;
    const priceRange = finalMax - finalMin;

    const width = 500;
    const height = 280;
    const yAxisWidth = 65;
    const chartHeight = height - 40;

    // Helper map to translate prices to SVG coords
    const getPointY = (p: number) => {
      const ratio = (p - finalMin) / priceRange;
      // Invert Y axes for screen coordinates
      return 15 + (chartHeight - ratio * chartHeight);
    };

    const entryY = getPointY(entry);
    const tpY = tp && tp > 0 ? getPointY(tp) : null;
    const slY = sl && sl > 0 ? getPointY(sl) : null;

    // Green shaded box (Gain/TP Zone)
    // Long trade: entry is below tp. Short: entry is above tp
    const isLongSetup = tp ? tp > entry : true;

    // Calculate R:R Ratio dynamically
    const riskAmt = Math.abs(entry - sl);
    const rewardAmt = tp ? Math.abs(tp - entry) : 0;
    const rrRatio = riskAmt === 0 ? 0 : rewardAmt / riskAmt;

    return (
      <div className="w-full h-full flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Risk-Reward Map Grid
          </span>
          <div className="flex bg-[#18181B] p-1 rounded-md text-[10px] font-mono text-slate-400 border border-slate-800/80">
            <button 
              onClick={() => setTimeframe('1H')} 
              className={`px-1.5 py-0.5 rounded transition ${timeframe === '1H' ? 'bg-emerald-500 font-extrabold text-black' : 'hover:text-slate-200'}`}
            >
              1H
            </button>
            <button 
              onClick={() => setTimeframe('4H')} 
              className={`px-1.5 py-0.5 rounded transition ${timeframe === '4H' ? 'bg-emerald-500 font-extrabold text-black' : 'hover:text-slate-200'}`}
            >
              4H
            </button>
            <button 
              onClick={() => setTimeframe('1D')} 
              className={`px-1.5 py-0.5 rounded transition ${timeframe === '1D' ? 'bg-emerald-500 font-extrabold text-black' : 'hover:text-slate-200'}`}
            >
              1D
            </button>
          </div>
        </div>

        <div className="relative w-full overflow-hidden flex-1 select-none">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Draw mock candlesticks in background with lowered opacity */}
            <g opacity="0.15">
              {candles.map((candle, idx) => {
                const scaledOpen = getPointY(entry + (candle.open - 100) * (priceRange / 50));
                const scaledClose = getPointY(entry + (candle.close - 100) * (priceRange / 50));
                const scaledHigh = getPointY(entry + (candle.high - 100) * (priceRange / 50));
                const scaledLow = getPointY(entry + (candle.low - 100) * (priceRange / 50));

                return (
                  <g key={idx}>
                    <line 
                      x1={candle.x} 
                      y1={scaledHigh} 
                      x2={candle.x} 
                      y2={scaledLow} 
                      className={candle.isUp ? "stroke-emerald-500" : "stroke-rose-500"} 
                      strokeWidth="1.5"
                    />
                    <rect 
                      x={candle.x - 5} 
                      y={Math.min(scaledOpen, scaledClose)} 
                      width="10" 
                      height={Math.max(1, Math.abs(scaledOpen - scaledClose))} 
                      className={candle.isUp ? "fill-emerald-500" : "fill-rose-500"} 
                    />
                  </g>
                );
              })}
            </g>

            {/* Target Boxes (Take profit and Stop Loss shades) */}
            {/* Top Area: Take Profit relative to Entry */}
            {tpY !== null && (
              <rect 
                x="15" 
                y={isLongSetup ? Math.min(entryY, tpY) : Math.min(entryY, tpY)} 
                width={width - yAxisWidth - 10} 
                height={Math.abs(entryY - tpY)} 
                fill={isLongSetup ? "#10b981" : "#ef4444"} 
                fillOpacity="0.12" 
              />
            )}

            {/* Bottom Area: Stop Loss relative to Entry */}
            {slY !== null && (
              <rect 
                x="15" 
                y={isLongSetup ? Math.min(entryY, slY) : Math.min(entryY, slY)} 
                width={width - yAxisWidth - 10} 
                height={Math.abs(entryY - slY)} 
                fill={isLongSetup ? "#ef4444" : "#10b981"} 
                fillOpacity="0.12" 
              />
            )}

            {/* Take Profit Target Line */}
            {tpY !== null && (
              <g>
                <line 
                  x1="15" 
                  y1={tpY} 
                  x2={width - yAxisWidth} 
                  y2={tpY} 
                  className={isLongSetup ? "stroke-emerald-400" : "stroke-rose-400"} 
                  strokeWidth="2" 
                  strokeDasharray="2 2"
                />
                <circle cx="20" cy={tpY} r="4" className={isLongSetup ? "fill-emerald-400" : "fill-rose-400"} />
                {/* Text Indicator on absolute right */}
                <rect 
                  x={width - yAxisWidth + 4} 
                  y={tpY - 10} 
                  width="55" 
                  height="18" 
                  rx="3" 
                  className={isLongSetup ? "fill-emerald-950/90 stroke-emerald-500" : "fill-rose-950/90 stroke-rose-400"} 
                  strokeWidth="1"
                />
                <text 
                  x={width - yAxisWidth + 31} 
                  y={tpY + 2} 
                  className="fill-slate-200 text-[10px] font-mono font-bold" 
                  textAnchor="middle"
                >
                  ${tp.toFixed(1)}
                </text>
                <text 
                  x="30" 
                  y={tpY - 6} 
                  className="fill-emerald-400/90 text-[10px] font-semibold"
                >
                  {isLongSetup ? "Target (Take Profit)" : "Stop Loss"}
                </text>
              </g>
            )}

            {/* Entry Price Line */}
            <g>
              <line 
                x1="15" 
                y1={entryY} 
                x2={width - yAxisWidth} 
                y2={entryY} 
                className="stroke-amber-400" 
                strokeWidth="2.5" 
              />
              <circle cx="20" cy={entryY} r="4.5" className="fill-amber-400" />
              <rect 
                x={width - yAxisWidth + 4} 
                y={entryY - 10} 
                width="55" 
                height="18" 
                rx="3" 
                className="fill-amber-950/90 stroke-amber-500" 
                strokeWidth="1"
              />
              <text 
                x={width - yAxisWidth + 31} 
                y={entryY + 2} 
                className="fill-slate-200 text-[10px] font-mono font-bold" 
                textAnchor="middle"
              >
                ${entry.toFixed(1)}
              </text>
              <text 
                x="30" 
                y={entryY - 6} 
                className="fill-amber-400/90 text-[10px] font-bold tracking-wider"
              >
                Entry Price Point
              </text>
            </g>

            {/* Stop Loss Target Line */}
            {slY !== null && (
              <g>
                <line 
                  x1="15" 
                  y1={slY} 
                  x2={width - yAxisWidth} 
                  y2={slY} 
                  className={isLongSetup ? "stroke-rose-400" : "stroke-emerald-400"} 
                  strokeWidth="2" 
                  strokeDasharray="2 2"
                />
                <circle cx="20" cy={slY} r="4" className={isLongSetup ? "fill-rose-400" : "fill-emerald-400"} />
                <rect 
                  x={width - yAxisWidth + 4} 
                  y={slY - 10} 
                  width="55" 
                  height="18" 
                  rx="3" 
                  className={isLongSetup ? "fill-rose-950/90 stroke-rose-500" : "fill-emerald-950/90 stroke-emerald-500"} 
                  strokeWidth="1"
                />
                <text 
                  x={width - yAxisWidth + 31} 
                  y={slY + 2} 
                  className="fill-slate-200 text-[10px] font-mono font-bold" 
                  textAnchor="middle"
                >
                  ${sl.toFixed(1)}
                </text>
                <text 
                  x="30" 
                  y={slY + 12} 
                  className="fill-rose-400/90 text-[10px] font-semibold"
                >
                  {isLongSetup ? "Stop Loss (Risk)" : "Target (Profit)"}
                </text>
              </g>
            )}

            {/* Overlay R:R ratio indicator */}
            {tp && sl && (
              <g transform={`translate(${width / 2 - 50}, 25)`}>
                <rect 
                  width="100" 
                  height="26" 
                  rx="6" 
                  className="fill-slate-950/95 stroke-slate-800" 
                  strokeWidth="1.5"
                />
                <text 
                  x="50" 
                  y="17" 
                  className="fill-emerald-400 text-[11px] font-mono font-bold" 
                  textAnchor="middle"
                >
                  Risk/Reward: {rrRatio.toFixed(2)}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    );
  };

  const renderLeverageRiskWheel = () => {
    return (
      <div className="flex flex-col justify-between h-full">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
            <Shield className="w-3.5 h-3.5" />
            Leverage Safety Index
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            Understanding buying power multiplying effects and liquidation levels can prevent margin calls.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative w-44 h-44">
            {/* Round Gauge visual representation using SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                className="stroke-slate-800/80" 
                strokeWidth="10" 
                fill="none" 
              />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                className="stroke-emerald-500" 
                strokeWidth="10" 
                fill="none" 
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * 0.65)} // 65% filled
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black font-mono text-slate-100">65%</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Risk Exposure</span>
            </div>
          </div>
        </div>

        <div className="bg-[#18181B] rounded-lg p-2.5 text-[10px] text-slate-400 border border-slate-800/80">
          <span className="text-xs text-emerald-400 font-semibold block mb-0.5">💡 Leverage Hint:</span>
          Higher leverage does not increase your profits directly—it only reduces the margin required, allowing you to take larger sizes which amplifies risk!
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#111114] border border-slate-800/80 rounded-2xl p-5 h-[330px] flex flex-col transition-all shadow-inner relative overflow-hidden">
      {/* Visual glowing aura behind charts */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {activeTab === 'compounding' ? renderCompoundingChart() : null}
      {isRiskRewardActive || isPnlActive ? renderTradingSetupChart() : null}
      {activeTab === 'leverage' ? renderLeverageRiskWheel() : null}
    </div>
  );
}
