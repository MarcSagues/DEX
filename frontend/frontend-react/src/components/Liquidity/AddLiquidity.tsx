import React, { useState, useEffect } from 'react';
import { formatUnits, parseUnits } from 'ethers';
import { useContracts, getAddresses } from '../../hooks/useContracts';
import { useBalances } from '../../hooks/useBalances';
import { useLiquidity } from '../../hooks/useLiquidity';
import { usePools } from '../../hooks/usePools';

interface AddLiquidityProps {
    connected: boolean;
    wallet: string | null;
    signer: any;
    chainId: number | null;
    onAddToken?: (address: string, symbol: string, decimals?: number) => void;
}

const AddLiquidity: React.FC<AddLiquidityProps> = ({ connected, wallet, signer, chainId, onAddToken }) => {
    const [tokenA, setTokenA] = useState('USDC');
    const [tokenB, setTokenB] = useState('DAI');
    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');
    const [estimatedLP, setEstimatedLP] = useState('0');
    const [poolShare, setPoolShare] = useState('0');
    const [inputMode, setInputMode] = useState<'A' | 'B'>('A');

    const contracts = useContracts(signer, chainId as any) as any;
    const { fromBalance: balanceA, toBalance: balanceB } = useBalances(contracts, wallet, tokenA, tokenB);
    const { addLiquidity, approveTokens, loading, error } = useLiquidity();
    const { quoteAddLiquidity } = usePools();

    const availableTokens = contracts?.tokens ? Object.keys(contracts.tokens) : ['USDC', 'DAI', 'USDT'];

    const handleApprove = async () => {
        if (!connected) return alert('Connect your wallet first');
        if (!contracts) return alert('No contracts available');
        if (!amountA || !amountB) return alert('Enter amounts for both tokens');

        try {
            await approveTokens(contracts, tokenA, tokenB, amountA, amountB);
            alert('Tokens approved successfully!');
        } catch (err: any) {
            console.error(err);
            alert('Approval failed: ' + err.message);
        }
    };

    const handleAddLiquidity = async () => {
        if (!connected) return alert('Connect your wallet first');
        if (!contracts) return alert('No contracts available');
        if (!amountA || !amountB) return alert('Enter amounts for both tokens');

        try {
            const amountAMin = (parseFloat(amountA) * 0.995).toString();
            const amountBMin = (parseFloat(amountB) * 0.995).toString();

            await addLiquidity({
                contracts,
                wallet,
                tokenA,
                tokenB,
                amountA,
                amountB,
                amountAMin,
                amountBMin
            });
            alert('Liquidity added successfully!');
            setAmountA('');
            setAmountB('');
        } catch (err: any) {
            console.error(err);
            alert('Add liquidity failed: ' + err.message);
        }
    };

    // ... (Keep existing useEffect logic for quotes)
    useEffect(() => {
        if (inputMode === 'A' && amountA && contracts) {
            quoteAddLiquidity(contracts, tokenA, tokenB, amountA).then(val => {
                if (val) {
                    setAmountB(val.quoteB);
                    if (val.totalSupply > BigInt(0) && val.reserveA > BigInt(0)) {
                        try {
                            const parsedAmountA = parseUnits(amountA, 18);
                            const estLP = (parsedAmountA * val.totalSupply) / val.reserveA;
                            setEstimatedLP(formatUnits(estLP, 18));
                            const totalSuppAfter = val.totalSupply + estLP;
                            const share = (Number(formatUnits(estLP, 18)) / Number(formatUnits(totalSuppAfter, 18))) * 100;
                            setPoolShare(share < 0.01 ? '< 0.01' : share.toFixed(2));
                        } catch (e) {
                            setEstimatedLP('~' + amountA);
                            setPoolShare('0');
                        }
                    } else {
                        setEstimatedLP('~' + amountA);
                        setPoolShare('100');
                    }
                } else {
                    setEstimatedLP('0');
                    setPoolShare('100');
                }
            });
        }
    }, [amountA, inputMode, tokenA, tokenB, contracts, quoteAddLiquidity]);

    useEffect(() => {
        if (inputMode === 'B' && amountB && contracts) {
            quoteAddLiquidity(contracts, tokenB, tokenA, amountB).then(val => {
                if (val) {
                    setAmountA(val.quoteB);
                    if (val.totalSupply > BigInt(0) && val.reserveA > BigInt(0)) {
                        try {
                            const parsedAmountB = parseUnits(amountB, 18);
                            const estLP = (parsedAmountB * val.totalSupply) / val.reserveA;
                            setEstimatedLP(formatUnits(estLP, 18));
                            const totalSuppAfter = val.totalSupply + estLP;
                            const share = (Number(formatUnits(estLP, 18)) / Number(formatUnits(totalSuppAfter, 18))) * 100;
                            setPoolShare(share < 0.01 ? '< 0.01' : share.toFixed(2));
                        } catch (e) {
                            setEstimatedLP('~' + amountB);
                            setPoolShare('0');
                        }
                    } else {
                        setEstimatedLP('~' + amountB);
                        setPoolShare('100');
                    }
                } else {
                    setEstimatedLP('0');
                    setPoolShare('100');
                }
            });
        }
    }, [amountB, inputMode, tokenA, tokenB, contracts, quoteAddLiquidity]);

    return (
        <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Messages */}
            <div className="min-h-[40px]">
                {loading && (
                    <div className="flex items-center justify-center gap-3 text-violet-400 font-bold bg-violet-500/10 py-3 rounded-2xl border border-violet-500/20 animate-pulse">
                        <span className="animate-spin inline-block w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full"></span>
                        Processing Transaction...
                    </div>
                )}
                {error && (
                    <div className="text-red-600 font-bold bg-red-50 py-3 px-6 rounded-2xl border border-red-100 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}
            </div>

            {/* Input Token A */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5">
                <div className="flex justify-between items-center mb-4 px-1">
                    <label className="text-slate-500 text-xs font-black uppercase tracking-widest">Deposit Token A</label>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => {
                                const addresses = getAddresses(chainId as number);
                                const addr = (addresses.tokens as any)[tokenA];
                                onAddToken?.(addr, tokenA);
                            }}
                            className="text-[10px] font-bold text-violet-400 hover:text-white transition flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10"
                        >
                            <span className="text-base leading-none">🦊</span> Import
                        </button>
                        <span className="text-slate-500 text-xs font-bold">Balance: <span className="text-white font-black">{parseFloat(balanceA).toFixed(4)}</span></span>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <select
                        value={tokenA}
                        onChange={(e) => setTokenA(e.target.value)}
                        className="bg-slate-800 text-white px-4 py-3 rounded-xl font-black text-sm border border-white/5 focus:outline-none focus:ring-2 focus:ring-violet-500/20 shadow-xl"
                    >
                        {availableTokens.map((token) => (
                            <option key={token} value={token}>{token}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={amountA}
                        onChange={(e) => {
                            setInputMode('A');
                            setAmountA(e.target.value);
                        }}
                        placeholder="0.00"
                        className="flex-1 bg-transparent text-white text-3xl font-black outline-none placeholder:text-slate-700"
                    />
                </div>
            </div>

            {/* Separator / Plus */}
            <div className="flex justify-center -my-6 relative z-10">
                <div className="bg-[#0a0c1a] rounded-2xl p-3 shadow-lg border border-white/5">
                    <div className="bg-violet-600 w-8 h-8 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                        +
                    </div>
                </div>
            </div>

            {/* Input Token B */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5">
                <div className="flex justify-between items-center mb-4 px-1">
                    <label className="text-slate-500 text-xs font-black uppercase tracking-widest">Deposit Token B</label>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => {
                                const addresses = getAddresses(chainId as number);
                                const addr = (addresses.tokens as any)[tokenB];
                                onAddToken?.(addr, tokenB);
                            }}
                            className="text-[10px] font-bold text-violet-400 hover:text-white transition flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10"
                        >
                            <span className="text-base leading-none">🦊</span> Import
                        </button>
                        <span className="text-slate-500 text-xs font-bold">Balance: <span className="text-white font-black">{parseFloat(balanceB).toFixed(4)}</span></span>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <select
                        value={tokenB}
                        onChange={(e) => setTokenB(e.target.value)}
                        className="bg-slate-800 text-white px-4 py-3 rounded-xl font-black text-sm border border-white/5 focus:outline-none focus:ring-2 focus:ring-violet-500/20 shadow-xl"
                    >
                        {availableTokens.map((token) => (
                            <option key={token} value={token}>{token}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={amountB}
                        onChange={(e) => {
                            setInputMode('B');
                            setAmountB(e.target.value);
                        }}
                        placeholder="0.00"
                        className="flex-1 bg-transparent text-white text-3xl font-black outline-none placeholder:text-slate-700"
                    />
                </div>
            </div>

            {/* Pool Statistics */}
            {amountA && amountB && (
                <div className="bg-violet-500/10 rounded-2xl p-5 space-y-3 border border-violet-500/20 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Estimated LP Tokens</span>
                        <span className="text-violet-400 font-black">{parseFloat(estimatedLP).toFixed(4)} LP</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Your Pool Share</span>
                        <span className="text-violet-400 font-black">{poolShare}%</span>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={handleApprove}
                    disabled={!connected || loading}
                    className="py-5 bg-white/5 hover:bg-white/10 disabled:bg-slate-900 disabled:text-slate-700 text-violet-400 font-black text-lg rounded-[24px] border border-white/5 transition shadow-2xl active:scale-95"
                >
                    1. Approve Tokens
                </button>
                <button
                    onClick={handleAddLiquidity}
                    disabled={!connected || !amountA || !amountB || loading}
                    className="py-5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-700 text-white font-black text-lg rounded-[24px] shadow-2xl shadow-violet-500/20 transition-all hover:-translate-y-1 active:scale-95"
                >
                    2. Add Liquidity
                </button>
            </div>
        </div>
    );
};

export default AddLiquidity;
