/// <reference types="jest" />
declare var jest: any;
declare var describe: any;
declare var it: any;
declare var expect: any;
import { renderHook } from '@testing-library/react';
import { usePools } from './usePools';
import { parseUnits } from 'ethers';

describe('usePools', () => {
    it('quoteAddLiquidity returns valid QuoteData', async () => {
        // Mock contracts object
        const mockContracts: any = {
            tokens: {
                USDC: { target: '0xUSDC' },
                DAI: { target: '0xDAI' }
            },
            factory: {
                getPair: jest.fn().mockResolvedValue('0xPair')
            },
            getPair: jest.fn().mockReturnValue({
                getReserves: jest.fn().mockResolvedValue([parseUnits('1000', 18), parseUnits('2000', 18)]),
                token0: jest.fn().mockResolvedValue('0xUSDC'),
                totalSupply: jest.fn().mockResolvedValue(parseUnits('1500', 18))
            }),
            router: {
                quote: jest.fn().mockResolvedValue(parseUnits('20', 18)) // mock response
            }
        };

        const { result } = renderHook(() => usePools());
        const quote = await result.current.quoteAddLiquidity(mockContracts, 'USDC', 'DAI', '10');

        expect(quote).not.toBeNull();
        expect(quote?.quoteB).toBe('20.0');
        expect(quote?.reserveA.toString()).toBe(parseUnits('1000', 18).toString());
        expect(quote?.reserveB.toString()).toBe(parseUnits('2000', 18).toString());
        expect(quote?.totalSupply.toString()).toBe(parseUnits('1500', 18).toString());
    });

    it('quoteAddLiquidity returns null if amount is invalid', async () => {
        const { result } = renderHook(() => usePools());
        const quote = await result.current.quoteAddLiquidity({} as any, 'USDC', 'DAI', '0');
        expect(quote).toBeNull();
    });
});
