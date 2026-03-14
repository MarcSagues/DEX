import { useState } from 'react';

export interface SwapHistoryItem {
    address: string; // Dirección del usuario que hizo el swap
    hash: string;
    fromToken: string;
    toToken: string;
    amountIn: string;
    amountOut: string;
    timestamp: number;
}

export function useSwapHistory() {
  const [history, setHistory] = useState<SwapHistoryItem[]>([]);

  const addSwap = (item: SwapHistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  return { history, addSwap };
}
