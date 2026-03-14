import React, { useEffect } from 'react';
import { usePools } from '../../hooks/usePools';
import { useContracts } from '../../hooks/useContracts';

interface MyPoolsProps {
    connected: boolean;
    wallet: string | null;
    signer: any;
    onNavigate?: (tab: 'add' | 'my-pools' | 'remove') => void;
}

const MyPools: React.FC<MyPoolsProps> = ({ connected, wallet, signer, onNavigate }) => {
    const contracts = useContracts(signer) as any;
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
                            onClick={() => {
                                if (onNavigate) onNavigate('add');
                            }}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
                        >
                            ➕ Add More
                        </button>
                        <button
                            onClick={() => {
                                if (onNavigate) onNavigate('remove');
                            }}
                            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
                        >
                            ➖ Remove
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyPools;
