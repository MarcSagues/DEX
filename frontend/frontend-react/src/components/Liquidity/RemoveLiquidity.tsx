import React, { useState, useEffect } from 'react';
import { usePools, PoolData } from '../../hooks/usePools';
import { useLiquidity } from '../../hooks/useLiquidity';
import { useContracts } from '../../hooks/useContracts';

interface RemoveLiquidityProps {
    connected: boolean;
    wallet: string | null;
    signer: any;
    chainId: number | null;
    onAddToken?: (address: string, symbol: string, decimals?: number) => void;
}

const RemoveLiquidity: React.FC<RemoveLiquidityProps> = ({ connected, wallet, signer, chainId, onAddToken }) => {
    const contracts = useContracts(signer, chainId as any) as any;
    const { getUserPools, loadingPools, userPools } = usePools();
    const { removeLiquidity, loading, error } = useLiquidity();

    const [selectedPoolPair, setSelectedPoolPair] = useState<string>('');
    const [selectedPoolData, setSelectedPoolData] = useState<PoolData | null>(null);

    const [percentage, setPercentage] = useState(50);
    const [lpAmount, setLpAmount] = useState('0');
    const [estimatedTokenA, setEstimatedTokenA] = useState('0');
    const [estimatedTokenB, setEstimatedTokenB] = useState('0');

    useEffect(() => {
        if (connected && wallet && contracts) {
            getUserPools(contracts, wallet);
        }
    }, [connected, wallet, contracts, getUserPools]);

    useEffect(() => {
        if (userPools.length > 0) {
            const currentPair = selectedPoolPair || userPools[0].pairAddress;
            const data = userPools.find(p => p.pairAddress === currentPair);
            if (data) {
                if (!selectedPoolPair) setSelectedPoolPair(currentPair);
                setSelectedPoolData(data);
                const newLpAmount = (Number(data.lpBalanceStr) * (percentage / 100)).toString();
                setLpAmount(newLpAmount);
                const tokenAAmount = (Number(data.userToken0Str) * (percentage / 100)).toString();
                const tokenBAmount = (Number(data.userToken1Str) * (percentage / 100)).toString();
                setEstimatedTokenA(tokenAAmount);
                setEstimatedTokenB(tokenBAmount);
            }
        } else {
            setSelectedPoolData(null);
            setEstimatedTokenA('0');
            setEstimatedTokenB('0');
        }
    }, [userPools, selectedPoolPair, percentage]);

    const handleRemoveLiquidity = async () => {
        if (!connected) return alert('Connect your wallet first');
        if (!selectedPoolData) return alert('Select a valid pool');
        if (!lpAmount || Number(lpAmount) <= 0) return alert('Enter a valid LP amount to remove');

        try {
            const amountAMin = (parseFloat(estimatedTokenA) * 0.995).toString();
            const amountBMin = (parseFloat(estimatedTokenB) * 0.995).toString();

            await removeLiquidity({
                contracts,
                wallet,
                tokenA: selectedPoolData.token0Symbol,
                tokenB: selectedPoolData.token1Symbol,
                liquidity: lpAmount,
                amountAMin,
                amountBMin
            });

            alert('Liquidity removed successfully!');
            if (connected && wallet && contracts) {
                getUserPools(contracts, wallet);
            }
            setSelectedPoolPair('');
            setPercentage(50);
            setLpAmount('0');
            setEstimatedTokenA('0');
            setEstimatedTokenB('0');
        } catch (err: any) {
            console.error('Removal failed:', err);
            alert('Removal failed: ' + err?.message);
        }
    };

    const handlePercentageChange = (value: number) => {
        setPercentage(value);
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="min-h-[40px]">
                {loading && (
                    <div className="flex items-center justify-center gap-3 text-violet-400 font-bold bg-violet-500/10 py-3 rounded-2xl border border-violet-500/20 animate-pulse">
                        <span className="animate-spin inline-block w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full"></span>
                        Processing Removal...
                    </div>
                )}
                {error && (
                    <div className="text-amber-600 font-bold bg-amber-50 py-3 px-6 rounded-2xl border border-amber-100 flex items-center gap-2 text-sm">
                        <span>⚠️</span> {error}
                    </div>
                )}
                {!connected && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-amber-500 text-sm font-bold flex items-center gap-3">
                        <span className="text-xl">⚠️</span> Connect your wallet to remove liquidity
                    </div>
                )}
            </div>

            {/* Pool Selection */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5">
                <label className="text-slate-500 text-xs font-black uppercase tracking-widest mb-4 block">Select Liquidity Pool</label>
                {loadingPools ? (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 animate-pulse text-violet-400 font-bold text-center">Loading Pools...</div>
                ) : userPools.length === 0 ? (
                    <div className="bg-white/5 p-4 rounded-xl border border-dashed border-white/10 text-slate-500 font-bold text-center">No Active Pools Found</div>
                ) : (
                    <select
                        value={selectedPoolPair}
                        onChange={(e) => setSelectedPoolPair(e.target.value)}
                        className="w-full bg-slate-800 text-white px-5 py-4 rounded-2xl font-black text-sm border-2 border-white/5 focus:border-violet-500/30 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all shadow-xl"
                    >
                        {userPools.map((pool) => (
                            <option key={pool.pairAddress} value={pool.pairAddress}>
                                {pool.token0Symbol}/{pool.token1Symbol} — {parseFloat(pool.lpBalanceStr).toFixed(2)} LP tokens
                            </option>
                        ))}
                    </select>
                )}
                {selectedPoolData && (
                    <div className="mt-4 flex justify-between items-center px-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Available Position</span>
                        <span className="text-xs font-black text-white bg-white/5 px-2 py-1 rounded-lg border border-white/10 shadow-xl">{parseFloat(selectedPoolData.lpBalanceStr).toFixed(4)} LP</span>
                    </div>
                )}
            </div>

            {/* Amount Slider */}
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-6">
                <div className="flex justify-between items-center px-1">
                    <label className="text-slate-500 text-xs font-black uppercase tracking-widest">Amount to Remove</label>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white leading-none">{percentage}</span>
                        <span className="text-sm font-black text-slate-500">%</span>
                    </div>
                </div>

                <div className="relative pt-2">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={percentage}
                        onChange={(e) => handlePercentageChange(Number(e.target.value))}
                        className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-violet-600 focus:outline-none transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    {[25, 50, 75, 100].map((value) => (
                        <button
                            key={value}
                            onClick={() => handlePercentageChange(value)}
                            className={`
                                flex-1 py-3 rounded-xl font-black text-sm transition-all duration-300
                                ${percentage === value
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl'
                                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                                }
                            `}
                        >
                            {value}%
                        </button>
                    ))}
                </div>
            </div>

            {/* Separator */}
            <div className="flex justify-center -my-6 relative z-10">
                <div className="bg-[#0a0c1a] rounded-2xl p-3 shadow-lg border border-white/5">
                    <div className="bg-white/5 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 text-lg font-bold">
                        ↓
                    </div>
                </div>
            </div>

            {/* Output Amounts */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 space-y-4">
                <label className="text-slate-500 text-xs font-black uppercase tracking-widest px-1 block mb-2">You will receive (Estimate)</label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 shadow-2xl group hover:border-violet-500/20 transition-all">
                        <div className="min-w-0">
                            <div className="text-xl font-black text-white truncate">{parseFloat(estimatedTokenA).toFixed(4)}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedPoolData?.token0Symbol || '-'}</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-400 text-sm font-black border border-violet-500/20">
                            {selectedPoolData?.token0Symbol[0] || '?'}
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 shadow-2xl group hover:border-violet-500/20 transition-all">
                        <div className="min-w-0">
                            <div className="text-xl font-black text-white truncate">{parseFloat(estimatedTokenB).toFixed(4)}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedPoolData?.token1Symbol || '-'}</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-400 text-sm font-black border border-violet-500/20">
                            {selectedPoolData?.token1Symbol[0] || '?'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={handleRemoveLiquidity}
                disabled={!connected || !lpAmount || lpAmount === '0' || loading}
                className={`
                    w-full py-6 rounded-[28px] font-black text-xl transition-all duration-500 transform
                    ${connected && lpAmount !== '0' && !loading
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-2xl shadow-violet-500/20 hover:-translate-y-1.5 active:scale-[0.98]'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'
                    }
                `}
            >
                {loading ? 'Confirming Withdrawal...' : !connected ? 'Connect Wallet' : 'Remove Liquidity'}
            </button>
        </div>
    );
};

export default RemoveLiquidity;
