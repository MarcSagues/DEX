import React, { useState, useEffect } from 'react';
import { Contract, formatUnits, parseUnits } from 'ethers';
import { getAddresses } from './useContracts';

interface Contracts {
    router: Contract;
    factory: Contract;
    tokens: {
        [key: string]: Contract;
    };
    getPair: (address: string) => Contract;
}

/**
 * Hook personalizado para calcular precios en tiempo real
 * 
 * @param contracts - Instancias de los contratos
 * @param fromToken - Token origen
 * @param toToken - Token destino
 * @param chainId - ID de la cadena conectada
 * @returns Precio calculado, tasa de cambio, impacto en precio
 */
export function usePriceCalculation(
    contracts: Contracts | null,
    fromToken: string,
    toToken: string,
    chainId: number | null
) {
    const [swapRate, setSwapRate] = useState('0');
    const [priceImpact, setPriceImpact] = useState('0');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calcula el impacto en precio y la tasa de cambio automáticamente
    // Guardar último valor válido
    const lastValid = React.useRef({ swapRate: '1', priceImpact: '0' });
    useEffect(() => {
        async function calculateImpact() {
            setLoading(true);
            setError(null);
            try {
                if (!contracts || fromToken === toToken) {
                    setSwapRate('1');
                    setPriceImpact('0');
                    lastValid.current = { swapRate: '1', priceImpact: '0' };
                    setLoading(false);
                    return;
                }
                const addresses = getAddresses(chainId);
                const tokenInAddress = addresses.tokens[fromToken as keyof typeof addresses.tokens];
                const tokenOutAddress = addresses.tokens[toToken as keyof typeof addresses.tokens];
                const pairAddress = await contracts.factory.getPair(tokenInAddress, tokenOutAddress);
                if (pairAddress === '0x0000000000000000000000000000000000000000') {
                    setSwapRate(lastValid.current.swapRate);
                    setPriceImpact(lastValid.current.priceImpact);
                    setLoading(false);
                    return;
                }
                const pair = contracts.getPair(pairAddress);
                const reserves = await pair.getReserves();
                const [reserve0, reserve1] = reserves;
                const token0 = await pair.token0();
                const [reserveIn, reserveOut] = token0.toLowerCase() === tokenInAddress.toLowerCase()
                    ? [reserve0, reserve1]
                    : [reserve1, reserve0];

                // Tasa de cambio spot (sin fee ni slippage)
                const spotRate = Number(reserveOut) / Number(reserveIn);
                if (!isFinite(spotRate) || spotRate <= 0) {
                    setSwapRate(lastValid.current.swapRate);
                } else {
                    setSwapRate(spotRate.toFixed(6));
                    lastValid.current.swapRate = spotRate.toFixed(6);
                }

                // Detectar inputMode y usar el campo correspondiente
                let inputAmount = '0';
                let mode = 'from';
                if (typeof window !== 'undefined') {
                    const fromInput = document.querySelector('input[name="fromAmount"]') as HTMLInputElement;
                    const toInput = document.querySelector('input[name="toAmount"]') as HTMLInputElement;
                    if (fromInput && fromInput === document.activeElement && fromInput.value && !isNaN(Number(fromInput.value)) && Number(fromInput.value) > 0) {
                        inputAmount = fromInput.value;
                        mode = 'from';
                    } else if (toInput && toInput === document.activeElement && toInput.value && !isNaN(Number(toInput.value)) && Number(toInput.value) > 0) {
                        inputAmount = toInput.value;
                        mode = 'to';
                    }
                }
                if (!inputAmount || isNaN(Number(inputAmount)) || Number(inputAmount) <= 0) {
                    setPriceImpact(lastValid.current.priceImpact);
                    setLoading(false);
                    return;
                }
                let impact = 0;
                if (mode === 'from') {
                    const amountIn = parseUnits(inputAmount, 18);
                    const amountOut = await contracts.router.getAmountOut(amountIn, reserveIn, reserveOut);
                    const effectiveRate = Number(formatUnits(amountOut, 18)) / Number(inputAmount);
                    if (!isFinite(effectiveRate) || effectiveRate <= 0) {
                        setPriceImpact(lastValid.current.priceImpact);
                        setLoading(false);
                        return;
                    }
                    impact = spotRate === 0 ? 0 : ((spotRate - effectiveRate) / spotRate) * 100;
                } else {
                    const amountOut = parseUnits(inputAmount, 18);
                    let amountIn;
                    try {
                        amountIn = await contracts.router.getAmountIn(amountOut, reserveIn, reserveOut);
                    } catch {
                        setPriceImpact(lastValid.current.priceImpact);
                        setLoading(false);
                        return;
                    }
                    const effectiveRate = Number(inputAmount) / Number(formatUnits(amountIn, 18));
                    if (!isFinite(effectiveRate) || effectiveRate <= 0) {
                        setPriceImpact(lastValid.current.priceImpact);
                        setLoading(false);
                        return;
                    }
                    impact = spotRate === 0 ? 0 : ((spotRate - effectiveRate) / spotRate) * 100;
                }
                setPriceImpact(Math.abs(impact).toFixed(2));
                lastValid.current.priceImpact = Math.abs(impact).toFixed(2);
            } catch (e) {
                setSwapRate(lastValid.current.swapRate);
                setPriceImpact(lastValid.current.priceImpact);
                setError('No se pudo calcular el impacto');
            }
            setLoading(false);
        }

        calculateImpact();
    }, [contracts, fromToken, toToken, chainId]);

    // Calcula el output dado un input
    const getOutputAmount = async (inputAmount: string): Promise<string> => {
        if (!inputAmount || inputAmount === '0' || parseFloat(inputAmount) === 0) return '';
        if (fromToken === toToken) return inputAmount;
        if (!contracts) return '';
        try {
            const addresses = getAddresses(chainId);
            // Obtener direcciones de tokens
            const tokenInAddress = addresses.tokens[fromToken as keyof typeof addresses.tokens];
            const tokenOutAddress = addresses.tokens[toToken as keyof typeof addresses.tokens];
            // Obtener dirección del par
            const pairAddress = await contracts.factory.getPair(tokenInAddress, tokenOutAddress);
            if (pairAddress === '0x0000000000000000000000000000000000000000') return '';
            const pair = contracts.getPair(pairAddress);
            const reserves = await pair.getReserves();
            const [reserve0, reserve1] = reserves;
            const token0 = await pair.token0();
            const [reserveIn, reserveOut] = token0.toLowerCase() === tokenInAddress.toLowerCase()
                ? [reserve0, reserve1]
                : [reserve1, reserve0];
            const amountIn = parseUnits(inputAmount, 18);
            const amountOut = await contracts.router.getAmountOut(amountIn, reserveIn, reserveOut);
            return formatUnits(amountOut, 18);
        } catch (error) {
            console.error("Error in getOutputAmount:", error);
            return '';
        }
    };

    // Calcula el input necesario para un output
    const getInputAmount = async (outputAmount: string): Promise<string> => {
        if (!outputAmount || outputAmount === '0' || parseFloat(outputAmount) === 0) return '';
        if (fromToken === toToken) return outputAmount;
        if (!contracts) return '';
        try {
            const addresses = getAddresses(chainId);
            // Obtener direcciones de tokens
            const tokenInAddress = addresses.tokens[fromToken as keyof typeof addresses.tokens];
            const tokenOutAddress = addresses.tokens[toToken as keyof typeof addresses.tokens];
            // Obtener dirección del par
            const pairAddress = await contracts.factory.getPair(tokenInAddress, tokenOutAddress);
            if (pairAddress === '0x0000000000000000000000000000000000000000') return '';
            const pair = contracts.getPair(pairAddress);
            const reserves = await pair.getReserves();
            const [reserve0, reserve1] = reserves;
            const token0 = await pair.token0();
            const [reserveIn, reserveOut] = token0.toLowerCase() === tokenInAddress.toLowerCase()
                ? [reserve0, reserve1]
                : [reserve1, reserve0];
            const amountOut = parseUnits(outputAmount, 18);
            const amountIn = await contracts.router.getAmountIn(amountOut, reserveIn, reserveOut);
            return formatUnits(amountIn, 18);
        } catch (error) {
            console.error("Error in getInputAmount:", error);
            return '';
        }
    };

    // Puedes mantener el cálculo de swapRate y priceImpact si lo necesitas

    return { getOutputAmount, getInputAmount, swapRate, priceImpact, loading, error };
}
