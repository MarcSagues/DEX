import React, { useState, useEffect } from 'react';
import { usePools, PoolData } from '../../hooks/usePools';
import { useLiquidity } from '../../hooks/useLiquidity';
import { useContracts } from '../../hooks/useContracts';
import { formatUnits } from 'ethers';

interface RemoveLiquidityProps {
    connected: boolean;
    wallet: string | null;
    signer: any;
}

const RemoveLiquidity: React.FC<RemoveLiquidityProps> = ({ connected, wallet, signer }) => {
    const contracts = useContracts(signer) as any;
    const { getUserPools, loadingPools, userPools } = usePools();
    const { removeLiquidity, loading, error } = useLiquidity();

    const [selectedPoolPair, setSelectedPoolPair] = useState<string>('');
    const [selectedPoolData, setSelectedPoolData] = useState<PoolData | null>(null);

    const [percentage, setPercentage] = useState(50);
    const [lpAmount, setLpAmount] = useState('0');
    const [estimatedTokenA, setEstimatedTokenA] = useState('0');
    const [estimatedTokenB, setEstimatedTokenB] = useState('0');

    // Load user pools on mount
    useEffect(() => {
        if (connected && wallet && contracts) {
            getUserPools(contracts, wallet);
        }
    }, [connected, wallet, contracts, getUserPools]);

    // Update selected pool data when list load or select changes
    useEffect(() => {
        if (userPools.length > 0) {
            const currentPair = selectedPoolPair || userPools[0].pairAddress;
            const data = userPools.find(p => p.pairAddress === currentPair);
            if (data) {
                if (!selectedPoolPair) setSelectedPoolPair(currentPair);
                setSelectedPoolData(data);

                // Recalculate amounts
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
            // Apply 0.5% slippage tolerance
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

            // Optionally, refresh pools or reset state
            if (connected && wallet && contracts) {
                getUserPools(contracts, wallet);
            }
            setSelectedPoolPair(''); // Reset selection
            setPercentage(50); // Reset percentage
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
        <div className="space-y-6">
            {!connected && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-yellow-400">
                    ⚠️ Connect your wallet to remove liquidity
                </div>
            )}

            {/* Pool Selection */}
            <div className="bg-gray-800/50 rounded-xl p-6">
                <label className="text-gray-400 text-sm mb-3 block">Select Pool</label>
                {loadingPools ? (
                    <div className="text-purple-400 font-bold">Loading pools...</div>
                ) : (
                    <select
                        value={selectedPoolPair}
                        onChange={(e) => setSelectedPoolPair(e.target.value)}
                        className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold"
                    >
                        {userPools.map((pool) => (
                            <option key={pool.pairAddress} value={pool.pairAddress}>
                                {pool.token0Symbol}/{pool.token1Symbol} ({parseFloat(pool.lpBalanceStr).toFixed(2)} LP)
                            </option>
                        ))}
                    </select>
                )}
                {selectedPoolData && (
                    <div className="mt-4 p-4 bg-gray-900/50 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total LP tokens</span>
                            <span className="text-white font-semibold">{parseFloat(selectedPoolData.lpBalanceStr).toFixed(4)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Amount Slider */}
            <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-gray-400 text-sm">Amount to Remove</label>
                    <span className="text-white font-bold text-2xl">{percentage}%</span>
                </div>

                <input
                    type="range"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => handlePercentageChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />

                <div className="flex gap-2 mt-4">
                    {[25, 50, 75, 100].map((value) => (
                        <button
                            key={value}
                            onClick={() => handlePercentageChange(value)}
                            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${percentage === value
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                }`}
                        >
                            {value}%
                        </button>
                    ))}
                </div>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-center">
                <div className="bg-purple-600/20 p-3 rounded-full">
                    <span className="text-2xl">⬇️</span>
                </div>
            </div>

            {/* Output Amounts */}
            <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
                <div className="text-sm text-gray-400 mb-3">You will receive</div>

                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
                    <div>
                        <div className="text-2xl font-bold text-white">{parseFloat(estimatedTokenA).toFixed(4)}</div>
                        <div className="text-sm text-gray-400">{selectedPoolData?.token0Symbol || '-'}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {selectedPoolData?.token0Symbol[0] || '?'}
                    </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
                    <div>
                        <div className="text-2xl font-bold text-white">{parseFloat(estimatedTokenB).toFixed(4)}</div>
                        <div className="text-sm text-gray-400">{selectedPoolData?.token1Symbol || '-'}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                        {selectedPoolData?.token1Symbol[0] || '?'}
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
                {loading && <div className="text-purple-400 font-bold mb-4 text-center">Processing removal...</div>}
                {error && <div className="text-red-500 font-bold mb-4 text-center">{error}</div>}

                <button
                    onClick={handleRemoveLiquidity}
                    disabled={!connected || !lpAmount || lpAmount === '0'}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-lg"
                >
                    Approve & Remove Liquidity
                </button>
            </div>
        </div>
    );
};

export default RemoveLiquidity;
