import React, { useEffect } from 'react';
import { usePools } from '../../hooks/usePools';
import { useContracts } from '../../hooks/useContracts';

interface MyPoolsProps {
    connected: boolean;
    wallet: string | null;
    signer: any;
    chainId: number | null;
    onAddToken?: (address: string, symbol: string, decimals?: number) => void;
    onNavigate: (tab: 'add' | 'my-pools' | 'remove') => void;
}

const MyPools: React.FC<MyPoolsProps> = ({ connected, wallet, signer, chainId, onAddToken, onNavigate }) => {
    const contracts = useContracts(signer, chainId as any) as any;
    const { getUserPools, loadingPools: loading, userPools: pools } = usePools();

    useEffect(() => {
        if (connected && wallet && contracts) {
            getUserPools(contracts, wallet);
        }
    }, [connected, wallet, contracts, getUserPools]);

    if (!connected) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl shadow-inner mb-6">🔌</div>
                <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Wallet Not Connected</h3>
                <p className="text-slate-500 font-medium max-w-xs text-center">Connect your wallet to manage your liquidity positions and view your earnings.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mb-6"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching your positions...</p>
            </div>
        );
    }

    if (pools.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-500/10 to-transparent rounded-[32px] flex items-center justify-center text-6xl shadow-2xl border border-white/10 mb-8">💧</div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">No Liquidity Positions Yet</h3>
                <p className="text-slate-500 font-medium mb-10 max-w-sm text-center">Provide liquidity to token pairs to earn fees on every trade made through the platform.</p>
                <button
                    onClick={() => onNavigate('add')}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black py-4 px-12 rounded-2xl shadow-2xl shadow-violet-500/20 transition-all hover:-translate-y-1 active:scale-95"
                >
                    Add Liquidity Now
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {pools.map((pool, index) => (
                <div
                    key={index}
                    className="bg-slate-900/40 backdrop-blur-md rounded-[28px] p-6 border border-white/5 shadow-sm hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-lg border-2 border-white shadow-md">
                                    {pool.token0Symbol[0]}
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-black text-lg border-2 border-white shadow-md">
                                    {pool.token1Symbol[0]}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">
                                    {pool.token0Symbol}/{pool.token1Symbol}
                                </h3>
                                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
                                    {pool.pairAddress.slice(0, 10)}...{pool.pairAddress.slice(-6)}
                                </p>
                            </div>
                        </div>
                        <div className="bg-violet-500/10 px-3 py-1.5 rounded-xl border border-violet-500/20">
                           <span className="text-[10px] font-black text-violet-400 uppercase">LP Share: </span>
                           <span className="text-xs font-black text-violet-300">{pool.poolShareStr}%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">My Deposits</div>
                            <div className="space-y-1">
                                <div className="text-sm font-black text-white">
                                    {parseFloat(pool.userToken0Str).toFixed(2)} <span className="text-slate-400 text-[10px]">{pool.token0Symbol}</span>
                                </div>
                                <div className="text-sm font-black text-white">
                                    {parseFloat(pool.userToken1Str).toFixed(2)} <span className="text-slate-400 text-[10px]">{pool.token1Symbol}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">LP Balance</div>
                            <div className="text-xl font-black text-white leading-none mb-1">
                                {parseFloat(pool.lpBalanceStr).toFixed(4)}
                            </div>
                            <div className="text-[10px] font-bold text-violet-500 uppercase">LP Tokens</div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => onNavigate('add')}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-xl border border-white/10 transition shadow-2xl active:scale-95"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => onNavigate('remove')}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-all border border-white/5 shadow-2xl active:scale-95"
                        >
                            Remove
                        </button>
                        <button
                            onClick={() => onAddToken?.(pool.pairAddress, `${pool.token0Symbol}-${pool.token1Symbol} LP`)}
                            className="w-12 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl border border-white/10 transition shadow-2xl flex items-center justify-center active:scale-95"
                            title="Import LP to MetaMask"
                        >
                            <span className="text-xl">🦊</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyPools;
