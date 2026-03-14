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
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🔌</div>
                <h3 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h3>
                <p className="text-gray-400">Connect your wallet to see your pools</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin text-4xl mb-4">⚙️</div>
                <p className="text-gray-400">Loading your pools...</p>
            </div>
        );
    }

    if (pools.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">💧</div>
                <h3 className="text-xl font-bold text-white mb-2">No Liquidity Yet</h3>
                <p className="text-gray-400">Add liquidity to start earning fees</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Pools List */}
            {pools.map((pool, index) => (
                <div
                    key={index}
                    className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold border-2 border-gray-900">
                                    {pool.token0Symbol[0]}
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold border-2 border-gray-900">
                                    {pool.token1Symbol[0]}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    {pool.token0Symbol}/{pool.token1Symbol}
                                </h3>
                                <p className="text-xs text-gray-500">{pool.pairAddress.slice(0, 6)}...{pool.pairAddress.slice(-4)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-white">
                                {parseFloat(pool.userToken0Str).toFixed(2)} {pool.token0Symbol}
                            </div>
                            <div className="text-sm font-bold text-white">
                                {parseFloat(pool.userToken1Str).toFixed(2)} {pool.token1Symbol}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-900/50 rounded-lg p-3">
                            <div className="text-sm text-gray-400 mb-1">Your LP Tokens</div>
                            <div className="text-lg font-bold text-white">{parseFloat(pool.lpBalanceStr).toFixed(4)}</div>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-3">
                            <div className="text-sm text-gray-400 mb-1">Pool Share</div>
                            <div className="text-lg font-bold text-purple-400">{pool.poolShareStr}%</div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => onNavigate('add')}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => onNavigate('remove')}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
                        >
                            Remove
                        </button>
                        <button
                            onClick={() => onAddToken?.(pool.pairAddress, `DEX-LP-${pool.token0Symbol}-${pool.token1Symbol}`)}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                            title="Añadir LP a MetaMask"
                        >
                            <span>🦊</span> <span className="text-xs">Import LP</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyPools;
