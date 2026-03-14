import { useState } from 'react';
import { Contract, parseUnits } from 'ethers';

interface Contracts {
    router: Contract;
    tokens: { [key: string]: Contract };
}

interface UseSwapParams {
    contracts: Contracts | null;
    wallet: string | null;
    fromToken: string;
    toToken: string;
    amountIn: string;
    amountOutMin: string; // Slippage protection
}

/**
 * Hook para ejecutar swaps en el DEX
 *
 * Pistas:
 * 1. Debes aprobar el token de entrada (fromToken) al router antes de hacer el swap.
 * 2. Usa contracts.tokens[fromToken].approve(routerAddress, cantidad)
 * 3. El swap se hace con contracts.router.swapExactTokensForTokens(...)
 * 4. El path es un array de direcciones: [fromTokenAddress, toTokenAddress]
 * 5. El destinatario es la wallet conectada
 * 6. El deadline es un timestamp futuro (ej: Date.now()/1000 + 60*10)
 *
 * Implementa la función swap() usando estas pistas.
 */
export function useSwap() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    /**
     * Ejecuta el swap
     * @param params Parámetros necesarios para el swap
     */
    const swap = async (params: UseSwapParams) => {
        setLoading(true);
        setError(null);
        setTxHash(null);
        try {
            // 1️⃣ Aprobar el token de entrada (fromToken) al router
            const approveTx = await params.contracts?.tokens[params.fromToken].approve(
                params.contracts.router.target, // Usar .target en ethers v6
                parseUnits(params.amountIn, 18)
            );
            await approveTx.wait();

            // 2️⃣ Ejecutar el swap
            const swapTx = await params.contracts?.router.swapExactTokensForTokens(
                parseUnits(params.amountIn, 18),
                parseUnits(params.amountOutMin, 18),
                [
                    params.contracts.tokens[params.fromToken].target,
                    params.contracts.tokens[params.toToken].target
                ],
                params.wallet!            );
            await swapTx.wait();

            // 3️⃣ Guardar el hash de la transacción
            setTxHash(swapTx.hash);
        } catch (err: any) {
            console.error('Swap error:', err);
            setError(err?.message || String(err) || 'Error ejecutando swap');
        } finally {
            setLoading(false);
        }
    };

    return { swap, loading, error, txHash };
}
