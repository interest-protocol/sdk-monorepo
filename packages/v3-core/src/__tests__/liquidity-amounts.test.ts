import { LiquidityAmounts } from '@/math';

describe('getLiquidityForAmounts', () => {
  it('should return the liquidity for amounts', () => {
    expect(
      LiquidityAmounts.getLiquidityForAmounts({
        sqrtPriceX64: 18446744073709551616n,
        sqrtPriceAX64: 17588280367669894507n,
        sqrtPriceBX64: 19347108404436883958n,
        amount0: 100n,
        amount1: 200n,
      })
    ).toEqual(2148n);

    expect(
      LiquidityAmounts.getLiquidityForAmounts({
        sqrtPriceX64: 17500118006140547654n,
        sqrtPriceAX64: 17588280367669894507n,
        sqrtPriceBX64: 19347108404436883958n,
        amount0: 100n,
        amount1: 200n,
      })
    ).toEqual(1048n);

    expect(
      LiquidityAmounts.getLiquidityForAmounts({
        sqrtPriceX64: 19434850842809205733n,
        sqrtPriceAX64: 17588280367669894507n,
        sqrtPriceBX64: 19347108404436883958n,
        amount0: 100n,
        amount1: 200n,
      })
    ).toEqual(2097n);

    expect(
      LiquidityAmounts.getLiquidityForAmounts({
        sqrtPriceX64: 17588280367669894507n,
        sqrtPriceAX64: 17588280367669894507n,
        sqrtPriceBX64: 19347108404436883958n,
        amount0: 100n,
        amount1: 200n,
      })
    ).toEqual(1048n);
  });

  it('should return the amounts for liquidity', () => {
    expect(
      LiquidityAmounts.getAmountsForLiquidity({
        sqrtPriceX64: 18446744073709551616n,
        sqrtPriceAX64: 17588280367669894507n,
        sqrtPriceBX64: 19347108404436883958n,
        liquidity: 2148n,
      })
    ).toEqual([99n, 99n]);

    expect(
      LiquidityAmounts.getAmountsForLiquidity({
        sqrtPriceX64: 19434850842809205733n,
        sqrtPriceAX64: 17588280367669894507n,
        sqrtPriceBX64: 19347108404436883958n,
        liquidity: 2097n,
      })
    ).toEqual([0n, 199n]);

    expect(
      LiquidityAmounts.getAmountsForLiquidity({
        sqrtPriceX64: 17588280367669894507n,
        sqrtPriceAX64: 17588280367669894507n,
        sqrtPriceBX64: 19347108404436883958n,
        liquidity: 1048n,
      })
    ).toEqual([99n, 0n]);

    expect(
      LiquidityAmounts.getAmountsForLiquidity({
        sqrtPriceX64: 19347108404436883958n,
        sqrtPriceAX64: 17588280367669894507n,
        sqrtPriceBX64: 19347108404436883958n,
        liquidity: 2097n,
      })
    ).toEqual([0n, 199n]);
  });
});
