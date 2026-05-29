/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PositionSizeResult {
  riskAmount: number;
  positionSize: number;
  maxLoss: number;
  notionalValue: number;
}

export function calculatePositionSize(
  balance: number,
  riskPct: number,
  entryPrice: number,
  stopLossPrice: number
): PositionSizeResult {
  if (balance <= 0 || riskPct <= 0 || entryPrice <= 0 || stopLossPrice <= 0) {
    return { riskAmount: 0, positionSize: 0, maxLoss: 0, notionalValue: 0 };
  }

  const riskAmount = balance * (riskPct / 100);
  const priceDiff = Math.abs(entryPrice - stopLossPrice);

  if (priceDiff === 0) {
    return { riskAmount, positionSize: 0, maxLoss: 0, notionalValue: 0 };
  }

  const positionSize = riskAmount / priceDiff;
  const maxLoss = riskAmount;
  const notionalValue = positionSize * entryPrice;

  return {
    riskAmount,
    positionSize,
    maxLoss,
    notionalValue,
  };
}

export interface RiskRewardResult {
  riskDistance: number;
  rewardDistance: number;
  ratio: number;
  ratioText: string;
  gainPercent: number;
  lossPercent: number;
}

export function calculateRiskReward(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number
): RiskRewardResult {
  if (entryPrice <= 0 || stopLoss <= 0 || takeProfit <= 0) {
    return { riskDistance: 0, rewardDistance: 0, ratio: 0, ratioText: "1:0", gainPercent: 0, lossPercent: 0 };
  }

  const riskDistance = Math.abs(entryPrice - stopLoss);
  const rewardDistance = Math.abs(takeProfit - entryPrice);

  const ratio = riskDistance === 0 ? 0 : rewardDistance / riskDistance;
  const ratioText = `1:${ratio.toFixed(2)}`;

  const gainPercent = (rewardDistance / entryPrice) * 100;
  const lossPercent = (riskDistance / entryPrice) * 100;

  return {
    riskDistance,
    rewardDistance,
    ratio,
    ratioText,
    gainPercent,
    lossPercent,
  };
}

export interface PnlResult {
  grossPnl: number;
  netPnl: number;
  pctChange: number;
  totalFees: number;
}

export function calculatePnl(
  buyPrice: number,
  sellPrice: number,
  quantity: number,
  isLong: boolean = true,
  feePercent: number = 0.1
): PnlResult {
  if (buyPrice <= 0 || sellPrice <= 0 || quantity <= 0) {
    return { grossPnl: 0, netPnl: 0, pctChange: 0, totalFees: 0 };
  }

  const grossPnl = isLong
    ? (sellPrice - buyPrice) * quantity
    : (buyPrice - sellPrice) * quantity;

  const pctChange = isLong
    ? ((sellPrice - buyPrice) / buyPrice) * 100
    : ((buyPrice - sellPrice) / buyPrice) * 100;

  // Trading fee typically calculated as percentage of trading volume
  const buyCost = buyPrice * quantity;
  const sellCost = sellPrice * quantity;
  const totalFees = (buyCost + sellCost) * (feePercent / 100);
  const netPnl = grossPnl - totalFees;

  return {
    grossPnl,
    netPnl,
    pctChange,
    totalFees,
  };
}

export interface LeverageResult {
  marginRequired: number;
  leverageRatio: number;
  freeMargin: number;
  isOverLeveraged: boolean;
}

export function calculateLeverage(
  balance: number,
  leverage: number,
  tradeSize: number // value of trade (notional value)
): LeverageResult {
  if (balance <= 0 || leverage <= 0 || tradeSize <= 0) {
    return { marginRequired: 0, leverageRatio: 0, freeMargin: 0, isOverLeveraged: false };
  }

  const marginRequired = tradeSize / leverage;
  const leverageRatio = tradeSize / balance;
  const freeMargin = balance - marginRequired;
  const isOverLeveraged = marginRequired > balance;

  return {
    marginRequired,
    leverageRatio,
    freeMargin,
    isOverLeveraged,
  };
}

export interface CompoundingPeriod {
  period: number;
  startBalance: number;
  profit: number;
  endBalance: number;
  totalProfit: number;
}

export interface CompoundingResult {
  finalBalance: number;
  totalProfit: number;
  totalGrowthPercent: number;
  periods: CompoundingPeriod[];
}

export function calculateCompounding(
  startBalance: number,
  growthPct: number,
  periodCount: number,
  reinvestRate: number = 100
): CompoundingResult {
  if (startBalance <= 0 || periodCount <= 0) {
    return { finalBalance: 0, totalProfit: 0, totalGrowthPercent: 0, periods: [] };
  }

  const periods: CompoundingPeriod[] = [];
  let currentBalance = startBalance;
  let accumulatedProfit = 0;

  for (let i = 1; i <= periodCount; i++) {
    const profit = currentBalance * (growthPct / 100);
    const reinvested = profit * (reinvestRate / 100);
    const endBalance = currentBalance + reinvested;
    accumulatedProfit += reinvested; // or endBalance - startBalance

    periods.push({
      period: i,
      startBalance: currentBalance,
      profit: reinvested, // dynamic reinvested profit
      endBalance,
      totalProfit: endBalance - startBalance,
    });

    currentBalance = endBalance;
  }

  const finalBalance = currentBalance;
  const totalProfit = finalBalance - startBalance;
  const totalGrowthPercent = (totalProfit / startBalance) * 100;

  return {
    finalBalance,
    totalProfit,
    totalGrowthPercent,
    periods,
  };
}

export interface PipCalculatorResult {
  pipValue: number;
  totalValue: number;
  pipAmountValue: number;
}

export function calculatePips(
  symbol: string,
  tradeSize: number, // standard, mini, micro lot
  lotCount: number,
  pips: number,
  useJpy: boolean = false
): PipCalculatorResult {
  if (tradeSize <= 0 || lotCount <= 0) {
    return { pipValue: 0, totalValue: 0, pipAmountValue: 0 };
  }

  // JPY pairs use 0.01 for pip, other pairs usually look like 0.0001
  const pipDecimal = useJpy ? 0.01 : 0.0001;
  const standardLotSize = tradeSize * lotCount;
  const pipValue = standardLotSize * pipDecimal; 
  const pipAmountValue = pipValue * pips;

  return {
    pipValue,
    totalValue: standardLotSize,
    pipAmountValue,
  };
}

export interface CryptoFeeResult {
  orderValue: number;
  makerRate: number;
  takerRate: number;
  makerFee: number;
  takerFee: number;
  difference: number;
}

export function calculateCryptoFees(
  price: number,
  amount: number,
  customMakerLevel: number = 0.1,
  customTakerLevel: number = 0.1
): CryptoFeeResult {
  if (price <= 0 || amount <= 0) {
    return { orderValue: 0, makerRate: 0, takerRate: 0, makerFee: 0, takerFee: 0, difference: 0 };
  }

  const orderValue = price * amount;
  const makerFee = orderValue * (customMakerLevel / 100);
  const takerFee = orderValue * (customTakerLevel / 100);
  const difference = Math.abs(takerFee - makerFee);

  return {
    orderValue,
    makerRate: customMakerLevel,
    takerRate: customTakerLevel,
    makerFee,
    takerFee,
    difference,
  };
}
