/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HistoryRecord {
  id: string;
  type: 'position-size' | 'risk-reward' | 'pnl' | 'leverage' | 'compounding' | 'pip' | 'crypto-fee';
  title: string;
  timestamp: string;
  inputs: Record<string, number | string>;
  outputs: Record<string, number | string>;
}

export interface MarketTicker {
  symbol: string;
  price: number;
  change: number;
  name: string;
}

export interface ForexPairConfig {
  symbol: string;
  pipSize: number; // 0.0001 or 0.01 for JPY
  standardLotSize: number; // 100,000
}

export interface CryptoFeeConfig {
  exchange: string;
  makerRate: number; // in percentage e.g., 0.1
  takerRate: number; // in percentage e.g., 0.1
}
