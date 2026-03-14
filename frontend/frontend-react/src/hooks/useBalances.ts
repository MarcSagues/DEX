import { useState, useEffect } from 'react';
import { Contract, formatUnits } from 'ethers';

interface Contracts {
    router: Contract;
    factory: Contract;
    tokens: {
        [key: string]: Contract;
    };
    getPair: (address: string) => Contract;
}

/**
 * Hook personalizado para leer balances de tokens
 * 
 * @param contracts - Instancias de los contratos
 * @param wallet - Dirección de la wallet conectada
 * @param fromToken - Token origen (USDC, DAI, USDT)
 * @param toToken - Token destino (USDC, DAI, USDT)
 * @returns Balances formateados y función para recargar
 */
export function useBalances(
    contracts: Contracts | null,
    wallet: string | null,
    fromToken: string,
    toToken: string
) {
    const [fromBalance, setFromBalance] = useState('0');
    const [toBalance, setToBalance] = useState('0');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadBalances = async () => {
        // Validaciones
        if (!contracts || !wallet) {
            console.log('⚠️ No hay wallet o contracts disponibles para leer balances');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('📖 Leyendo balances de', fromToken, 'y', toToken);

            // Obtener contratos de los tokens
            const fromTokenContract = contracts.tokens[fromToken];
            const toTokenContract = contracts.tokens[toToken];

            // Leer balances del blockchain
            const [fromBal, toBal] = await Promise.all([
                fromTokenContract.balanceOf(wallet),
                toTokenContract.balanceOf(wallet)
            ]);

            // Convertir de wei a formato legible (18 decimales)
            const fromBalanceFormatted = formatUnits(fromBal, 18);
            const toBalanceFormatted = formatUnits(toBal, 18);

            console.log('✅ Balance', fromToken + ':', fromBalanceFormatted);
            console.log('✅ Balance', toToken + ':', toBalanceFormatted);

            // Guardar en estados
            setFromBalance(fromBalanceFormatted);
            setToBalance(toBalanceFormatted);

        } catch (err: any) {
            console.error('❌ Error leyendo balances:', err);
            setError(err.message || 'Error al leer balances');
        } finally {
            setLoading(false);
        }
    };

    // Auto-cargar balances cuando cambien las dependencias
    useEffect(() => {
        loadBalances();
    }, [contracts, wallet, fromToken, toToken]);

    return {
        fromBalance,
        toBalance,
        loading,
        error,
        reload: loadBalances // Para recargar manualmente
    };
}
