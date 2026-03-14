import { useMemo } from 'react';
import { Contract } from 'ethers';

// ABIs (se copiarán automáticamente al hacer deploy)
import DEXRouterABI from '../contracts/DEXRouter.json';
import DEXFactoryABI from '../contracts/DEXFactory.json';
import DEXPairABI from '../contracts/DEXPair.json';
import MockERC20ABI from '../contracts/MockERC20.json';

// Direcciones (se generarán automáticamente al hacer deploy)
import addressesLocal from '../contracts/addresses-localhost.json';
import addressesSepolia from '../contracts/addresses-sepolia.json';

const getAddresses = (chainId) => {
  const id = Number(chainId);
  if (id === 11155111) return addressesSepolia;
  return addressesLocal; // Default to local
};

/**
 * Hook personalizado para obtener instancias de los contratos
 * @param {Object} signer - Signer de ethers.js (del wallet conectado)
 * @param {number} chainId - ID de la cadena conectada
 * @returns {Object} Instancias de los contratos
 */
export function useContracts(signer, chainId) {
  const contracts = useMemo(() => {
    if (!signer || !chainId) return null;

    const addresses = getAddresses(chainId);

    return {
      // Contratos principales
      router: new Contract(addresses.router, DEXRouterABI, signer),
      factory: new Contract(addresses.factory, DEXFactoryABI, signer),
      
      // Tokens
      tokens: {
        USDC: new Contract(addresses.tokens.USDC, MockERC20ABI, signer),
        DAI: new Contract(addresses.tokens.DAI, MockERC20ABI, signer),
        USDT: new Contract(addresses.tokens.USDT, MockERC20ABI, signer),
      },
      
      // Pares (se pueden crear dinámicamente cuando se necesiten)
      getPair: (pairAddress) => new Contract(pairAddress, DEXPairABI, signer),
    };
  }, [signer, chainId]);

  return contracts;
}

// Direcciones para fácil acceso (se deben usar con precaución ahora que son dinámicas)
export { addressesLocal, addressesSepolia, getAddresses };
