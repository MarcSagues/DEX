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
            alert('Por favor conecta tu wallet primero');
            return;
        }
        console.log(wallet)
        if (!wallet) {
            alert('No hay wallet conectada');
            return;
        }
        if (!contracts) {
            alert('No hay contratos disponibles');
            return;
        }
        if (!fromToken || !toToken) {
            alert('Selecciona ambos tokens');
            return;
        }
        if (!fromAmount || isNaN(Number(fromAmount)) || Number(fromAmount) <= 0) {
            alert('Ingresa una cantidad válida');
            return;
        }

        console.log('Swap:', { fromToken, toToken, fromAmount });
        swap({
            contracts,
            wallet,
            fromToken,
            toToken,
            amountIn: fromAmount,
            amountOutMin: toAmount, // Para protección contra slippage
        });

        addSwap({
            address: wallet || '',
            hash: txHash || '',
            fromToken,
            toToken,
            amountIn: fromAmount,
            amountOut: toAmount,
            timestamp: Math.floor(Date.now() / 1000)
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Loading y error */}
            {loading && (
                <div className="flex items-center justify-center gap-2 text-purple-700 font-semibold mb-4">
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full"></span>
                    Procesando swap...
                </div>
            )}
            {error && (
                <div className="text-red-600 font-semibold mb-4">{error}</div>
            )}

            {/* Swap Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                {/* From Token */}
                <div className="mb-4">
                    <label className="text-gray-600 text-sm font-semibold mb-2 block">
                        Desde
                    </label>
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 focus-within:border-purple-500 transition">
                        <div className="flex gap-4">
                            <select
                                value={fromToken}
                                onChange={(e) => setFromToken(e.target.value)}
                                className="bg-white rounded-lg px-4 py-2 font-semibold text-gray-800 border-2 border-gray-200 focus:outline-none focus:border-purple-500 cursor-pointer"
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
                                placeholder="0.0"
                                className="flex-1 bg-transparent text-2xl font-bold text-gray-800 focus:outline-none"
                            />
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                            <button 
                                onClick={() => {
                                    const addresses = getAddresses(chainId as number);
                                    const addr = (addresses.tokens as any)[fromToken];
                                    onAddToken?.(addr, fromToken);
                                }}
                                className="flex items-center gap-1 hover:text-purple-600 transition"
                                title="Añadir a MetaMask"
                            >
                                🦊 Importar {fromToken}
                            </button>
                            <span>Balance: {parseFloat(fromBalance).toFixed(4)} {fromToken}</span>
                        </div>
                    </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-2 relative z-10">
                    <button
                        className="bg-white rounded-xl p-3 shadow-lg border-4 border-purple-100 hover:border-purple-300 transition transform hover:rotate-180 duration-300"
                        onClick={() => {
                            // Intercambiar tokens
                            setFromToken(toToken);
                            setToToken(fromToken);
                            // Intercambiar cantidades
                            setFromAmount(toAmount);
                        }}
                    >
                        <span className="text-2xl"></span>
                    </button>
                </div>

                {/* To Token */}
                <div className="mb-6">
                    <label className="text-gray-600 text-sm font-semibold mb-2 block">
                        Hacia
                    </label>
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 focus-within:border-purple-500 transition">
                        <div className="flex gap-4">
                            <select
                                value={toToken}
                                onChange={(e) => setToToken(e.target.value)}
                                className="bg-white rounded-lg px-4 py-2 font-semibold text-gray-800 border-2 border-gray-200 focus:outline-none focus:border-purple-500 cursor-pointer"
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
                                placeholder="0.0"
                                className="flex-1 bg-transparent text-2xl font-bold text-gray-800 focus:outline-none"
                            />
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                            <button 
                                onClick={() => {
                                    const addresses = getAddresses(chainId as number);
                                    const addr = (addresses.tokens as any)[toToken];
                                    onAddToken?.(addr, toToken);
                                }}
                                className="flex items-center gap-1 hover:text-purple-600 transition"
                                title="Añadir a MetaMask"
                            >
                                🦊 Importar {toToken}
                            </button>
                            <span>Balance: {parseFloat(toBalance).toFixed(4)} {toToken}</span>
                        </div>
                    </div>
                </div>

                {/* Swap Info */}
                <div className="bg-purple-50 rounded-xl p-4 mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tasa de cambio</span>
                        <span className="font-semibold text-gray-800">
                            1 {fromToken} = {swapRate === '0' ? '0.00' : swapRate} {toToken}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fee de transacción</span>
                        <span className="font-semibold text-gray-800">0.3%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impacto en precio</span>
                        <span className={`font-semibold ${parseFloat(priceImpact) > 1 ? 'text-red-600' : 'text-green-600'}`}>
                            {priceImpact === '0' ? '< 0.01%' : `${priceImpact}%`}
                        </span>
                    </div>
                </div>

                {/* Swap Button */}
                <button
                    onClick={handleSwap}
                    disabled={!connected || !fromAmount}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition transform ${connected && fromAmount
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {!connected ? '🦊 Conecta tu Wallet' : !fromAmount ? 'Ingresa una cantidad' : '✨ Intercambiar'}
                </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2"></div>
                    <div className="font-semibold text-gray-800">Rápido</div>
                    <div className="text-sm text-gray-600">Swaps instantáneos</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2"></div>
                    <div className="font-semibold text-gray-800">Seguro</div>
                    <div className="text-sm text-gray-600">Smart contracts auditados</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2"></div>
                    <div className="font-semibold text-gray-800">Mejores Precios</div>
                    <div className="text-sm text-gray-600">Liquidez optimizada</div>
                </div>
            </div>

            {/* Historial de swaps */}
            {/* <SwapHistory history={history} /> */}
        </div>
    );
};

export default Swap;
