import { useState } from 'react';
import { Contract, parseUnits } from 'ethers';

interface Contracts {
    router: Contract;
    factory: Contract;
    tokens: { [key: string]: Contract };
    getPair: (address: string) => Contract;
}

interface AddLiquidityParams {
    contracts: Contracts | null;
    wallet: string | null;
    tokenA: string; // symbol e.g., 'USDC'
    tokenB: string; // symbol e.g., 'DAI'
    amountA: string;
    amountB: string;
    amountAMin: string;
    amountBMin: string;
}

interface RemoveLiquidityParams {
    contracts: Contracts | null;
    wallet: string | null;
    tokenA: string; // symbol e.g., 'USDC'
    tokenB: string; // symbol e.g., 'DAI'
    liquidity: string; // LP token amount
    amountAMin: string;
    amountBMin: string;
}

export function useLiquidity() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const approveTokens = async (
        contracts: Contracts,
        tokenA: string,
        tokenB: string,
        amountA: string,
        amountB: string
    ) => {
        const routerAddress = contracts.router.target;
        
        const txA = await contracts.tokens[tokenA].approve(routerAddress, parseUnits(amountA, 18));
        await txA.wait();

        const txB = await contracts.tokens[tokenB].approve(routerAddress, parseUnits(amountB, 18));
        await txB.wait();
    };

    const addLiquidity = async (params: AddLiquidityParams) => {
        if (!params.contracts || !params.wallet) return;

        setLoading(true);
        setError(null);
        setTxHash(null);

        try {
            const tokenAAddress = params.contracts.tokens[params.tokenA].target;
            const tokenBAddress = params.contracts.tokens[params.tokenB].target;

            // 1. Get the Pair address
            const pairAddress = await params.contracts.factory.getPair(tokenAAddress, tokenBAddress);

            // 2. Approve tokens to Router
            await approveTokens(params.contracts, params.tokenA, params.tokenB, params.amountA, params.amountB);

            // 3. Add Liquidity
            const tx = await params.contracts.router.addLiquidity(
                tokenAAddress,
                tokenBAddress,
                parseUnits(params.amountA, 18),
                parseUnits(params.amountB, 18),
                parseUnits(params.amountAMin, 18),
                parseUnits(params.amountBMin, 18),
                params.wallet
            );
            const receipt = await tx.wait();
            setTxHash(receipt.hash);
            return receipt;
        } catch (err: any) {
            console.error('Failed to add liquidity:', err);
            setError(err?.message || String(err) || 'Error adding liquidity');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeLiquidity = async (params: RemoveLiquidityParams) => {
        if (!params.contracts || !params.wallet) return;

        setLoading(true);
        setError(null);
        setTxHash(null);

        try {
            const tokenAAddress = params.contracts.tokens[params.tokenA].target;
            const tokenBAddress = params.contracts.tokens[params.tokenB].target;

            // 1. Get the Pair address
            const pairAddress = await params.contracts.factory.getPair(tokenAAddress, tokenBAddress);
            
            // Generate pair contract instance
            const pairContract = params.contracts.getPair(pairAddress);

            // 2. Approve LP tokens to Router
            const txApprove = await pairContract.approve(
                params.contracts.router.target,
                parseUnits(params.liquidity, 18)
            );
            await txApprove.wait();

            // 3. Remove Liquidity
            const tx = await params.contracts.router.removeLiquidity(
                tokenAAddress,
                tokenBAddress,
                parseUnits(params.liquidity, 18), // assuming LP tokens have 18 decimals
                parseUnits(params.amountAMin, 18),
                parseUnits(params.amountBMin, 18),
                params.wallet
            );

            const receipt = await tx.wait();
            setTxHash(receipt.hash);
            return receipt;
        } catch (err: any) {
            console.error('Failed to remove liquidity:', err);
            setError(err?.message || String(err) || 'Error removing liquidity');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { addLiquidity, removeLiquidity, approveTokens, loading, error, txHash };
}
