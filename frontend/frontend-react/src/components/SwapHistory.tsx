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
        <div className="bg-white/90 rounded-xl p-4 mt-8 shadow">
            {history.length === 0 ? (
                <div className="text-gray-500 text-sm">No hay swaps recientes.</div>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {history.map((item, idx) => (
                        <li key={item.hash + idx} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                {/* Hash acortado */}
                                <span className="font-mono text-xs text-gray-400" title={item.hash}>{item.hash.slice(0, 8)}...</span>
                                {/* Wallet acortada con hover */}
                                <span className="font-mono text-xs text-blue-600" title={item.address}>{item.address.slice(0, 6)}...{item.address.slice(-4)}</span>
                                {/* Valor convertido y moneda */}
                                <span className="font-semibold">
                                    {(parseFloat(item.amountIn) / 1e18).toFixed(2)} {getTokenSymbol(item.fromToken)}
                                </span>
                                <span className="mx-1 text-gray-400">→</span>
                                <span className="font-semibold">→ {(parseFloat(item.amountOut) / 1e18).toFixed(2)} {getTokenSymbol(item.toToken)}</span>

                            </div>
                            <div className="text-xs text-gray-500 mt-1 md:mt-0">
                                {new Date(item.timestamp * 1000).toLocaleString()}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SwapHistory;
