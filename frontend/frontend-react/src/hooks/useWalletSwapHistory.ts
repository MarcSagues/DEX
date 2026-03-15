import { useEffect, useState } from 'react';
import { Contract } from 'ethers';
import { getAddresses } from './useContracts';
import RouterABI from '../contracts/RouterABI';

export interface WalletSwap {
  hash: string;
  address: string;
  amountIn: string;
  amountOut: string;
  fromToken: string;
  toToken: string;
  timestamp: number;
}

/**
 * Hook para leer el historial real de swaps de la wallet conectada usando eventos de la blockchain
 * @param wallet Dirección de la wallet conectada
 * @param provider Instancia de ethers.js provider
 * @param chainId ID de la cadena conectada
 */
export function useWalletSwapHistory(wallet: string | null, provider: any, chainId: number | null) {
  const [swaps, setSwaps] = useState<WalletSwap[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet || !provider || !chainId) return;

    const fetchSwaps = async () => {
      setLoading(true);
      try {
        const addresses = getAddresses(chainId);
        // 1️⃣ Instanciar el contrato Router
        const router = new Contract(addresses.router, RouterABI, provider);


        // 2️⃣ Definir el filtro para el evento Swap (ajusta el nombre y los argumentos según tu contrato)
        // El evento es: Swap(address indexed user, address indexed fromToken, address indexed toToken, uint amountIn, uint amountOut)
        const filter = router.filters.Swap(wallet);
        const logs = await router.queryFilter(filter, 0, 'latest');

        // 3️⃣ Parsea los logs y filtra solo los de tu wallet
        const parsed = logs.map(log => {
          const args = (log as any).args;
          return {
            hash: log.transactionHash,
            address: args?.user || '',
            amountIn: args?.amountIn ? args.amountIn.toString() : '',
            amountOut: args?.amountOut ? args.amountOut.toString() : '',
            fromToken: args?.fromToken || '',
            toToken: args?.toToken || '',
            timestamp: log.blockNumber
          };
        });
        setSwaps(parsed);
      } catch (err) {
        console.error('Error leyendo swaps:', err);
      }
      setLoading(false);
    };

    fetchSwaps();
  }, [wallet, provider, chainId]);

  return { swaps, loading };
}
