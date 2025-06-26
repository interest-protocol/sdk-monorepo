import { BigNumber, BigNumberUtils } from '@/lib';
import { LiquidityAmounts, PriceEncoder, TickMath } from '@/math';

describe(LiquidityAmounts.name, () => {
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

  describe(LiquidityAmounts.getAmounts.name, () => {
    it('calculates properly when below range', () => {
      const currentSqrtPriceX64 = PriceEncoder.fromPrice(new BigNumber(2500));

      const lowerTick = TickMath.getTickAtSqrtRatio(
        PriceEncoder.fromPrice(new BigNumber(1500))
      );

      const upperTick = TickMath.getTickAtSqrtRatio(
        PriceEncoder.fromPrice(new BigNumber(2000))
      );

      expect(
        LiquidityAmounts.getAmounts({
          slippage: 0.01,
          lowerTick,
          upperTick,
          currentSqrtPriceX64: BigNumberUtils.toBigInt(currentSqrtPriceX64),
          isAmount0: false,
          amount: 100n,
          roundUp: false,
        })
      ).toEqual({
        amount0: 0n,
        amount1: 100n,
        maxAmount0: 0n,
        maxAmount1: 99n,
        liquidity: 16n,
        fixed0: false,
      });
    });

    it('calculates properly when above range', () => {
      const currentSqrtPriceX64 = PriceEncoder.fromPrice(new BigNumber(2500));

      const lowerTick = TickMath.getTickAtSqrtRatio(
        PriceEncoder.fromPrice(new BigNumber(3000))
      );

      const upperTick = TickMath.getTickAtSqrtRatio(
        PriceEncoder.fromPrice(new BigNumber(3500))
      );

      expect(
        LiquidityAmounts.getAmounts({
          slippage: 0.01,
          lowerTick,
          upperTick,
          currentSqrtPriceX64: BigNumberUtils.toBigInt(currentSqrtPriceX64),
          isAmount0: true,
          amount: 100n,
          roundUp: false,
        })
      ).toEqual({
        amount0: 100n,
        amount1: 0n,
        maxAmount0: 99n,
        maxAmount1: 0n,
        liquidity: 73815n,
        fixed0: true,
      });
    });

    it('calculates properly when within range', () => {
      const currentSqrtPriceX64 = PriceEncoder.fromPrice(new BigNumber(2500));

      const lowerTick = TickMath.getTickAtSqrtRatio(
        PriceEncoder.fromPrice(new BigNumber(2000))
      );

      const upperTick = TickMath.getTickAtSqrtRatio(
        PriceEncoder.fromPrice(new BigNumber(3000))
      );

      expect(
        LiquidityAmounts.getAmounts({
          slippage: 0.01,
          lowerTick,
          upperTick,
          currentSqrtPriceX64: BigNumberUtils.toBigInt(currentSqrtPriceX64),
          isAmount0: true,
          amount: 100n,
          roundUp: false,
        })
      ).toEqual({
        amount0: 99n,
        amount1: 303131n,
        maxAmount0: 98n,
        maxAmount1: 300099n,
        liquidity: 57406n,
        fixed0: true,
      });

      expect(
        LiquidityAmounts.getAmounts({
          slippage: 0.01,
          lowerTick,
          upperTick,
          currentSqrtPriceX64: BigNumberUtils.toBigInt(currentSqrtPriceX64),
          isAmount0: false,
          amount: 10_000n,
          roundUp: true,
        })
      ).toEqual({
        amount0: 4n,
        amount1: 9996n,
        maxAmount0: 5n,
        maxAmount1: 10096n,
        liquidity: 1893n,
        fixed0: false,
      });
    });
  });
});
