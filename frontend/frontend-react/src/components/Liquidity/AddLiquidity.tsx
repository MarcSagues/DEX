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

    // Lista de tokens disponibles basada en los integrados en el contrato
    const availableTokens = contracts?.tokens ? Object.keys(contracts.tokens) : ['USDC', 'DAI', 'USDT'];

    const handleApprove = async () => {
        if (!connected) return alert('Connect your wallet first');
        if (!contracts) return alert('No contracts available');
        if (!amountA || !amountB) return alert('Enter amounts for both tokens');

        try {
            await approveTokens(contracts, tokenA, tokenB, amountA, amountB);
            alert('Tokens approved!');
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
            // Apply 0.5% slippage tolerance
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
            // clear inputs
            setAmountA('');
            setAmountB('');
        } catch (err: any) {
            console.error(err);
            alert('Add liquidity failed: ' + err.message);
        }
    };

    // Calculate optimal token B
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
                    // Do not clear amountB here so users can type both amounts for initial liquidity
                    setEstimatedLP('0');
                    setPoolShare('100');
                }
            });
        }
    }, [amountA, inputMode, tokenA, tokenB, contracts, quoteAddLiquidity]);

    // Calculate optimal token A
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
                    // Do not clear amountA here so users can type both amounts for initial liquidity
                    setEstimatedLP('0');
                    setPoolShare('100');
                }
            });
        }
    }, [amountB, inputMode, tokenA, tokenB, contracts, quoteAddLiquidity]);

    return (
        <div className="space-y-6">
            {loading && <div className="text-purple-400 font-bold mb-4">Processing transaction...</div>}
            {error && <div className="text-red-500 font-bold mb-4">{error}</div>}
            {!connected && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-yellow-400">
                    ⚠️ Connect your wallet to add liquidity
                </div>
            )}

            {/* Token A Input */}
            <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-3">
                    <label className="text-gray-400 text-sm">Token A</label>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => {
                                const addresses = getAddresses(chainId as number);
                                const addr = (addresses.tokens as any)[tokenA];
                                onAddToken?.(addr, tokenA);
                            }}
                            className="text-xs text-purple-400 hover:text-purple-300 transition flex items-center gap-1"
                        >
                            🦊 Import {tokenA}
                        </button>
                        <span className="text-gray-400 text-sm">Balance: {parseFloat(balanceA).toFixed(4)}</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <select
                        value={tokenA}
                        onChange={(e) => setTokenA(e.target.value)}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold"
                    >
                        {availableTokens.map((token) => (
                            <option key={token} value={token}>
                                {token}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={amountA}
                        onChange={(e) => {
                            setInputMode('A');
                            setAmountA(e.target.value);
                        }}
                        placeholder="0.0"
                        className="flex-1 bg-transparent text-white text-2xl font-bold outline-none"
                    />
                </div>
            </div>

            {/* Plus Icon */}
            <div className="flex justify-center">
                <div className="bg-purple-600/20 p-3 rounded-full">
                    <span className="text-2xl">➕</span>
                </div>
            </div>

            {/* Token B Input */}
            <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-3">
                    <label className="text-gray-400 text-sm">Token B</label>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => {
                                const addresses = getAddresses(chainId as number);
                                const addr = (addresses.tokens as any)[tokenB];
                                onAddToken?.(addr, tokenB);
                            }}
                            className="text-xs text-purple-400 hover:text-purple-300 transition flex items-center gap-1"
                        >
                            🦊 Import {tokenB}
                        </button>
                        <span className="text-gray-400 text-sm">Balance: {parseFloat(balanceB).toFixed(4)}</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <select
                        value={tokenB}
                        onChange={(e) => setTokenB(e.target.value)}
                        className="bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold"
                    >
                        {availableTokens.map((token) => (
                            <option key={token} value={token}>
                                {token}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={amountB}
                        onChange={(e) => {
                            setInputMode('B');
                            setAmountB(e.target.value);
                        }}
                        placeholder="0.0"
                        className="flex-1 bg-transparent text-white text-2xl font-bold outline-none"
                    />
                </div>
            </div>

            {/* Pool Info */}
            {amountA && amountB && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Estimated LP Tokens</span>
                        <span className="text-white font-semibold">{estimatedLP}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Pool Share</span>
                        <span className="text-white font-semibold">{poolShare}%</span>
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div className="space-y-3">
                <button
                    onClick={handleApprove}
                    disabled={!connected}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200"
                >
                    1. Approve Tokens
                </button>
                <button
                    onClick={handleAddLiquidity}
                    disabled={!connected || !amountA || !amountB}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-lg"
                >
                    2. Add Liquidity
                </button>
            </div>
        </div>
    );
};

export default AddLiquidity;
