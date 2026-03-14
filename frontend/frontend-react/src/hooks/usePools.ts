import { useState, useCallback } from 'react';
import { Contract, formatUnits, parseUnits } from 'ethers';

export interface QuoteData {
    quoteB: string;
    reserveA: bigint;
    reserveB: bigint;
    totalSupply: bigint;
}

interface Contracts {
    router: Contract;
    factory: Contract;
    tokens: { [key: string]: Contract };
    getPair: (address: string) => Contract;
}

export interface PoolData {
    pairAddress: string;
    token0Symbol: string;
    token1Symbol: string;
    lpBalanceStr: string;
    lpBalance: bigint;
    totalSupplyStr: string;
    poolShareStr: string;
    reserve0Str: string;
    reserve1Str: string;
    userToken0Str: string;
    userToken1Str: string;
}

export function usePools() {
    const [loadingPools, setLoadingPools] = useState(false);
    const [userPools, setUserPools] = useState<PoolData[]>([]);

    /**
     * Estimates Token B amount given Token A amount based on current reserves.
     */
    const quoteAddLiquidity = async (
        contracts: Contracts,
        tokenA: string,
        tokenB: string,
        amountA: string
    ): Promise<QuoteData | null> => {
        try {
            if (!amountA || isNaN(Number(amountA)) || Number(amountA) <= 0) return null;
            
            const addrA = contracts.tokens[tokenA].target;
            const addrB = contracts.tokens[tokenB].target;

            const pairAddress = await contracts.factory.getPair(addrA, addrB);
            
            // If pair doesn't exist, we can't quote based on reserves (it will be 1:1 or determined by the first provider)
            if (pairAddress === '0x0000000000000000000000000000000000000000') {
               return null; 
            }

            const pairContract = contracts.getPair(pairAddress);
            const [reserve0, reserve1] = await pairContract.getReserves();
            
            if (reserve0 === BigInt(0) && reserve1 === BigInt(0)) {
                return null; // Empty pool
            }

            // We need to know which token is token0 and which is token1
            const token0Address = await pairContract.token0();
            const totalSupply = await pairContract.totalSupply();
            
            let reserveA: bigint, reserveB: bigint;
            // Ethers v6 targets might be slightly different in casing, so we compare loosely or dynamically
            if (token0Address.toLowerCase() === addrA.toString().toLowerCase()) {
                reserveA = reserve0;
                reserveB = reserve1;
            } else {
                reserveA = reserve1;
                reserveB = reserve0;
            }

            const parsedAmountA = parseUnits(amountA, 18);
            
            // Call router quote: amountB = (amountA * reserveB) / reserveA
            const quoteB = await contracts.router.quote(parsedAmountA, reserveA, reserveB);
            
            return {
                quoteB: formatUnits(quoteB, 18),
                reserveA,
                reserveB,
                totalSupply
            };

        } catch (err) {
            console.error('Error quoting add liquidity:', err);
            return null;
        }
    };

    /**
     * Fetches all pairs where the user has liquidity.
     */
    const getUserPools = useCallback(async (contracts: Contracts, wallet: string) => {
        setLoadingPools(true);
        try {
            const tokensList = Object.keys(contracts.tokens);
            const checkedPairs = new Set<string>();
            const pools: PoolData[] = [];

            for (let i = 0; i < tokensList.length; i++) {
                for (let j = i + 1; j < tokensList.length; j++) {
                    const symbolA = tokensList[i];
                    const symbolB = tokensList[j];

                    const addrA = contracts.tokens[symbolA].target;
                    const addrB = contracts.tokens[symbolB].target;

                    const pairAddress = await contracts.factory.getPair(addrA, addrB);

                    if (pairAddress === '0x0000000000000000000000000000000000000000') {
                        continue;
                    }

                    if (checkedPairs.has(pairAddress)) {
                        continue;
                    }
                    checkedPairs.add(pairAddress);

                    const pairContract = contracts.getPair(pairAddress);
                    const lpBalance = await pairContract.balanceOf(wallet);

                    if (lpBalance > BigInt(0)) {
                        const totalSupply = await pairContract.totalSupply();
                        const [reserve0, reserve1] = await pairContract.getReserves();
                        const token0Addr = await pairContract.token0();

                        let token0Symbol = symbolA;
                        let token1Symbol = symbolB;

                        if (token0Addr.toLowerCase() !== addrA.toString().toLowerCase()) {
                            token0Symbol = symbolB;
                            token1Symbol = symbolA;
                        }

                        // Calculate user share
                        // share = (lpBalance * 100) / totalSupply
                        const poolShareNumber = (Number(formatUnits(lpBalance, 18)) / Number(formatUnits(totalSupply, 18))) * 100;
                        const poolShareStr = poolShareNumber < 0.01 ? '< 0.01' : poolShareNumber.toFixed(2);

                        // Calculate underlying tokens
                        // userToken = (reserve * lpBalance) / totalSupply
                        const userToken0 = (reserve0 * lpBalance) / totalSupply;
                        const userToken1 = (reserve1 * lpBalance) / totalSupply;

                        pools.push({
                            pairAddress,
                            token0Symbol,
                            token1Symbol,
                            lpBalanceStr: formatUnits(lpBalance, 18),
                            lpBalance,
                            totalSupplyStr: formatUnits(totalSupply, 18),
                            poolShareStr,
                            reserve0Str: formatUnits(reserve0, 18),
                            reserve1Str: formatUnits(reserve1, 18),
                            userToken0Str: formatUnits(userToken0, 18),
                            userToken1Str: formatUnits(userToken1, 18),
                        });
                    }
                }
            }

            setUserPools(pools);

        } catch (err) {
            console.error('Error fetching user pools:', err);
        } finally {
            setLoadingPools(false);
        }
    }, []);

    return {
        quoteAddLiquidity,
        getUserPools,
        loadingPools,
        userPools
    };
}
