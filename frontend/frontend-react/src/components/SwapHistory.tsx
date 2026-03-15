import React from 'react';
import { SwapHistoryItem } from '../hooks/useSwapHistory';

interface SwapHistoryProps {
    history: SwapHistoryItem[];
}
// Helper para mostrar el símbolo del token
function getTokenSymbol(address: string): string {
    // Puedes mapear aquí tus tokens
    const map: Record<string, string> = {
        '0x4A679253410272dd5232B3Ff7cF5dbB88f295319': 'USDC',
        '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F': 'DAI',
        '0x09635F643e140090A9A8Dcd712eD6285858ceBef': 'USDT',
        // Añade más tokens si tienes
    };
    return map[address] || address.slice(0, 6) + '...';
}

const SwapHistory: React.FC<SwapHistoryProps> = ({ history }) => {
    return (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-2 md:p-4 border border-white/5">
            {history.length === 0 ? (
                <div className="text-slate-400 text-sm font-medium py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                   No recent swaps found.
                </div>
            ) : (
                <ul className="space-y-3">
                    {[...history].reverse().map((item, idx) => (
                        <li key={item.hash + idx} className="p-4 bg-white/5 rounded-xl border border-white/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-indigo-500/30 transition-colors">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400">
                                        TX
                                    </div>
                                    <span className="font-mono text-[10px] text-slate-400 font-bold" title={item.hash}>{item.hash.slice(0, 8)}...</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <span className="font-black text-white">
                                        {(parseFloat(item.amountIn) / 1e18).toFixed(2)} {getTokenSymbol(item.fromToken)}
                                    </span>
                                    <span className="text-slate-400">→</span>
                                    <span className="font-black text-indigo-400">
                                        {(parseFloat(item.amountOut) / 1e18).toFixed(2)} {getTokenSymbol(item.toToken)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-4 min-w-[120px]">
                                <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-400 uppercase">
                                    {new Date(item.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <a 
                                    href={`https://sepolia.etherscan.io/tx/${item.hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 px-3 bg-white/5 text-indigo-400 rounded-md text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all uppercase border border-white/5"
                                >
                                    View
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SwapHistory;
