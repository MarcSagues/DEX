import React from 'react';
import { useContracts, getAddresses } from '../../hooks/useContracts';
import { useBalances } from '../../hooks/useBalances';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { Contract } from 'ethers';
import { useSwap } from '../../hooks/useSwap';
import { useSwapHistory } from '../../hooks/useSwapHistory';
// import SwapHistory from '../SwapHistory';

interface SwapProps {
    connected: boolean;
    signer: any;
    wallet: string | null;
    chainId: number | null;
    onAddToken?: (address: string, symbol: string, decimals?: number) => void;
}

// Interfaz para tipar el retorno de useContracts
interface Contracts {
    router: Contract;
    factory: Contract;
    tokens: {
        USDC: Contract;
        DAI: Contract;
        USDT: Contract;
        [key: string]: Contract;
    };
    getPair: (address: string) => Contract;
}

const Swap: React.FC<SwapProps> = ({ connected, signer, wallet, chainId, onAddToken }) => {
    // Estados básicos de UI
    const [fromToken, setFromToken] = React.useState('USDC');
    const [toToken, setToToken] = React.useState('DAI');
    const [fromAmount, setFromAmount] = React.useState('');
    const [toAmount, setToAmount] = React.useState('');
    const [inputMode, setInputMode] = React.useState<'from' | 'to'>('from');

    // Obtener instancias de contratos
    const contracts = useContracts(signer, chainId as any) as Contracts | null;

    const tokens = contracts?.tokens ? Object.keys(contracts.tokens) : ['USDC', 'DAI', 'USDT'];

    // Hook personalizado: Leer balances
    const { fromBalance, toBalance } = useBalances(
        contracts,
        wallet,
        fromToken,
        toToken
    );

    // Hook personalizado: Calcular precio (expondrá dos funciones)
    const { getOutputAmount, getInputAmount, swapRate, priceImpact } = usePriceCalculation(contracts, fromToken, toToken, chainId);

    // Solo calcula el campo contrario cuando el usuario edita ese campo
    // Límite máximo para evitar valores imposibles
    const MAX_SWAP = 1e30;
    // Guardar último valor válido para cada campo
    const lastValid = React.useRef({ from: '', to: '' });
    React.useEffect(() => {
        if (inputMode === 'from') {
            if (fromAmount && !isNaN(Number(fromAmount))) {
                getOutputAmount(fromAmount).then(val => {
                    if (!val || isNaN(Number(val)) || Number(val) > MAX_SWAP) {
                        // Si el cálculo falla, mantener el último valor válido
                        setToAmount(lastValid.current.to);
                        return;
                    }
                    setToAmount(val);
                    lastValid.current.to = val;
                });
            } else {
                setToAmount('');
                lastValid.current.to = '';
            }
        } else if (inputMode === 'to') {
            if (toAmount && !isNaN(Number(toAmount))) {
                getInputAmount(toAmount).then(val => {
                    if (!val || isNaN(Number(val)) || Number(val) > MAX_SWAP) {
                        setFromAmount(lastValid.current.from);
                        return;
                    }
                    setFromAmount(val);
                    lastValid.current.from = val;
                });
            } else {
                setFromAmount('');
                lastValid.current.from = '';
            }
        }
        // eslint-disable-next-line
    }, [fromAmount, toAmount, fromToken, toToken, contracts, inputMode]);

    const { swap, loading, error, txHash } = useSwap();

    // Hook personalizado: Historial de swaps
    const { addSwap } = useSwapHistory();

    React.useEffect(() => {
        if (txHash && fromAmount && toAmount && fromToken && toToken) {
            addSwap({
                address: wallet || '',
                hash: txHash || '',
                fromToken,
                toToken,
                amountIn: fromAmount,
                amountOut: toAmount,
                timestamp: Math.floor(Date.now() / 1000)
            });
        }
        // eslint-disable-next-line
    }, [txHash]);

    const handleSwap = () => {
        if (!connected) {
            alert('Please connect your wallet first');
            return;
        }
        if (!wallet) {
            alert('No wallet connected');
            return;
        }
        if (!contracts) {
            alert('Contracts not available');
            return;
        }
        if (!fromToken || !toToken) {
            alert('Please select both tokens');
            return;
        }
        if (!fromAmount || isNaN(Number(fromAmount)) || Number(fromAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        swap({
            contracts,
            wallet,
            fromToken,
            toToken,
            amountIn: fromAmount,
            amountOutMin: toAmount,
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Status Messages */}
            <div className="min-h-[40px]">
                {loading && (
                    <div className="flex items-center justify-center gap-3 text-violet-400 font-bold bg-violet-500/10 py-3 rounded-2xl border border-violet-500/20 animate-pulse">
                        <span className="animate-spin inline-block w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full"></span>
                        Processing Swap...
                    </div>
                )}
                {error && (
                    <div className="text-red-600 font-bold bg-red-50 py-3 px-6 rounded-2xl border border-red-100 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}
            </div>

            {/* Swap Card */}
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-violet-500/5 border border-white/10 p-6 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"></div>
                
                {/* From Token */}
                <div className="space-y-3 mb-2">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-slate-500 text-sm font-bold uppercase tracking-wider">
                            Sell
                        </label>
                        <span className="text-slate-500 text-xs font-bold">
                            Balance: <span className="text-white font-black">{parseFloat(fromBalance).toFixed(4)} {fromToken}</span>
                        </span>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-6 border-2 border-transparent focus-within:border-violet-500/40 focus-within:bg-white/10 transition-all duration-300 shadow-inner">
                        <div className="flex gap-4 items-center">
                            <select
                                value={fromToken}
                                onChange={(e) => setFromToken(e.target.value)}
                                className="bg-slate-800 rounded-xl px-4 py-2 font-black text-white border border-white/5 focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer shadow-xl hover:border-violet-500/30 transition-all"
                            >
                                {tokens.map(token => (
                                    <option key={token} value={token}>{token}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                name="fromAmount"
                                value={fromAmount}
                                onFocus={() => setInputMode('from')}
                                onChange={(e) => {
                                    setInputMode('from');
                                    setFromAmount(e.target.value);
                                }}
                                placeholder="0.00"
                                className="flex-1 bg-transparent text-4xl font-black text-white focus:outline-none placeholder:text-slate-700 min-w-0 tracking-tighter"
                            />
                        </div>
                    </div>
                </div>

                {/* Swap Icon */}
                <div className="flex justify-center -my-6 relative z-10">
                    <button
                        className="bg-slate-800 rounded-2xl p-5 shadow-2xl border border-white/10 hover:shadow-violet-500/20 transition-all duration-500 transform hover:rotate-180 group active:scale-90"
                        onClick={() => {
                            setFromToken(toToken);
                            setToToken(fromToken);
                            setFromAmount(toAmount);
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-violet-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                    </button>
                </div>

                {/* To Token */}
                <div className="space-y-3 mb-8">
                     <div className="flex justify-between items-center px-2">
                        <label className="text-slate-500 text-sm font-bold uppercase tracking-wider">
                            Buy
                        </label>
                        <span className="text-slate-400 text-xs font-medium">
                            Balance: <span className="text-white font-bold">{parseFloat(toBalance).toFixed(4)} {toToken}</span>
                        </span>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-6 border-2 border-transparent focus-within:border-violet-500/40 focus-within:bg-white/10 transition-all duration-300 shadow-inner">
                        <div className="flex gap-4 items-center">
                            <select
                                value={toToken}
                                onChange={(e) => setToToken(e.target.value)}
                                className="bg-slate-800 rounded-xl px-4 py-2 font-black text-white border border-white/5 focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer shadow-xl hover:border-violet-500/30 transition-all"
                            >
                                {tokens.map(token => (
                                    <option key={token} value={token}>{token}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                name="toAmount"
                                value={toAmount}
                                onFocus={() => setInputMode('to')}
                                onChange={(e) => {
                                    setInputMode('to');
                                    setToAmount(e.target.value);
                                }}
                                placeholder="0.00"
                                className="flex-1 bg-transparent text-4xl font-black text-white focus:outline-none placeholder:text-slate-700 min-w-0 tracking-tighter"
                                readOnly={inputMode === 'from'}
                            />
                        </div>
                    </div>
                </div>

                {/* Price Info Box */}
                <div className="bg-violet-500/5 rounded-2xl p-6 mb-10 space-y-4 border border-violet-500/10">
                    <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-500 uppercase tracking-widest text-[10px]">Exchange Rate</span>
                        <span className="text-white tracking-tight">
                            1 {fromToken} ≈ {swapRate === '0' ? '0.00' : swapRate} {toToken}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Fee (0.3%)</span>
                        <span className="font-bold text-emerald-400">Reserved for LPs</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Price Impact</span>
                        <span className={`font-bold ${parseFloat(priceImpact) > 1 ? 'text-red-500' : 'text-emerald-400'}`}>
                            {priceImpact === '0' ? '< 0.01%' : `${priceImpact}%`}
                        </span>
                    </div>
                </div>

                {/* Main Action Button */}
                <button
                    onClick={handleSwap}
                    disabled={!connected || !fromAmount || loading}
                    className={`
                        w-full py-6 rounded-[28px] font-black text-xl transition-all duration-500 transform
                        ${connected && fromAmount && !loading
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-2xl shadow-violet-500/20 hover:-translate-y-1.5 active:scale-[0.98]'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'
                        }
                    `}
                >
                    {!connected 
                        ? 'Connect Wallet' 
                        : loading 
                            ? 'Confirming...' 
                            : !fromAmount 
                                ? 'Enter Amount' 
                                : 'Swap Tokens'
                    }
                </button>

                {/* Footer Link */}
                <div className="mt-8 border-t border-white/5 pt-8">
                    <button 
                        onClick={() => {
                            const addresses = getAddresses(chainId as number);
                            const addr = (addresses.tokens as any)[toToken];
                            onAddToken?.(addr, toToken);
                        }}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group"
                    >
                        <span className="text-base group-hover:scale-110 transition-transform">🦊</span> Import {toToken} to MetaMask
                    </button>
                </div>
            </div>

            {/* Features Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-5 rounded-[24px] border border-white/5 text-center shadow-2xl hover:border-violet-500/20 transition-all">
                    <div className="text-xl font-black text-white mb-1">Fast</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Instant Swaps</div>
                </div>
                <div className="bg-white/5 p-5 rounded-[24px] border border-white/5 text-center shadow-2xl hover:border-violet-500/20 transition-all">
                    <div className="text-xl font-black text-white mb-1">Secure</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Audited Contracts</div>
                </div>
                <div className="bg-white/5 p-5 rounded-[24px] border border-white/5 text-center shadow-2xl hover:border-violet-500/20 transition-all">
                    <div className="text-xl font-black text-white mb-1">Optimal</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Best Rates</div>
                </div>
            </div>
        </div>
    );
};

export default Swap;
