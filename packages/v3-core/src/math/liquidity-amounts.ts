import { Q64 } from '@/constants';
import { BigNumber, BigNumberUtils } from '@/lib';

import {
  GetAmount0ForLiquidityArgs,
  GetAmount1ForLiquidityArgs,
  GetAmountsForLiquidityArgs,
  GetLiquidityForAmount0Args,
  GetLiquidityForAmount1Args,
  GetLiquidityForAmountsArgs,
} from './math.types';

export abstract class LiquidityAmounts {
  private constructor() {}

  static getLiquidityForAmount0({
    sqrtPriceAX64,
    sqrtPriceBX64,
    amount0,
  }: GetLiquidityForAmount0Args): bigint {
    const amount0BN = new BigNumber(amount0);

    const [sqrtPriceAX64Bn, sqrtPriceBX64Bn] = BigNumberUtils.sort(
      sqrtPriceAX64,
      sqrtPriceBX64
    );

    const intermediate = sqrtPriceAX64Bn.multipliedBy(sqrtPriceBX64Bn).div(Q64);

    return BigNumberUtils.toBigInt(
      amount0BN
        .multipliedBy(intermediate)
        .div(sqrtPriceBX64Bn.minus(sqrtPriceAX64Bn))
    );
  }

  static getLiquidityForAmount1({
    sqrtPriceAX64,
    sqrtPriceBX64,
    amount1,
  }: GetLiquidityForAmount1Args): bigint {
    const amount1BN = new BigNumber(amount1);

    const [sqrtPriceAX64Bn, sqrtPriceBX64Bn] = BigNumberUtils.sort(
      sqrtPriceAX64,
      sqrtPriceBX64
    );

    return BigNumberUtils.toBigInt(
      amount1BN.multipliedBy(Q64).div(sqrtPriceBX64Bn.minus(sqrtPriceAX64Bn))
    );
  }

  static getLiquidityForAmounts({
    sqrtPriceX64,
    sqrtPriceAX64,
    sqrtPriceBX64,
    amount0,
    amount1,
  }: GetLiquidityForAmountsArgs): bigint {
    const sqrtPriceX64BN = new BigNumber(sqrtPriceX64);

    const [sqrtPriceAX64Bn, sqrtPriceBX64Bn] = BigNumberUtils.sort(
      sqrtPriceAX64,
      sqrtPriceBX64
    );

    if (sqrtPriceX64BN.isLessThanOrEqualTo(sqrtPriceAX64Bn)) {
      return LiquidityAmounts.getLiquidityForAmount0({
        sqrtPriceAX64: sqrtPriceAX64Bn,
        sqrtPriceBX64: sqrtPriceBX64Bn,
        amount0,
      });
    } else if (sqrtPriceX64BN.isLessThan(sqrtPriceBX64Bn)) {
      const liquidity0 = LiquidityAmounts.getLiquidityForAmount0({
        sqrtPriceAX64: sqrtPriceX64BN,
        sqrtPriceBX64: sqrtPriceBX64Bn,
        amount0,
      });

      const liquidity1 = LiquidityAmounts.getLiquidityForAmount1({
        sqrtPriceAX64: sqrtPriceAX64Bn,
        sqrtPriceBX64: sqrtPriceX64BN,
        amount1,
      });

      return BigNumberUtils.toBigInt(
        BigNumberUtils.min(liquidity0, liquidity1)
      );
    } else {
      return LiquidityAmounts.getLiquidityForAmount1({
        sqrtPriceAX64: sqrtPriceAX64Bn,
        sqrtPriceBX64: sqrtPriceBX64Bn,
        amount1,
      });
    }
  }

  static getAmount0ForLiquidity({
    sqrtPriceAX64,
    sqrtPriceBX64,
    liquidity,
  }: GetAmount0ForLiquidityArgs): bigint {
    const [sqrtPriceAX64Bn, sqrtPriceBX64Bn] = BigNumberUtils.sort(
      sqrtPriceAX64,
      sqrtPriceBX64
    );

    return BigNumberUtils.toBigInt(
      BigNumberUtils.shiftLeft(liquidity, 64)
        .multipliedBy(sqrtPriceBX64Bn.minus(sqrtPriceAX64Bn))
        .div(sqrtPriceBX64Bn)
        .div(sqrtPriceAX64Bn)
    );
  }

  static getAmount1ForLiquidity({
    sqrtPriceAX64,
    sqrtPriceBX64,
    liquidity,
  }: GetAmount1ForLiquidityArgs): bigint {
    const [sqrtPriceAX64Bn, sqrtPriceBX64Bn] = BigNumberUtils.sort(
      sqrtPriceAX64,
      sqrtPriceBX64
    );

    return BigNumberUtils.toBigInt(
      new BigNumber(liquidity)
        .multipliedBy(sqrtPriceBX64Bn.minus(sqrtPriceAX64Bn))
        .div(Q64)
    );
  }

  static getAmountsForLiquidity({
    sqrtPriceX64,
    sqrtPriceAX64,
    sqrtPriceBX64,
    liquidity,
  }: GetAmountsForLiquidityArgs): [bigint, bigint] {
    sqrtPriceX64 = new BigNumber(sqrtPriceX64);

    [sqrtPriceAX64, sqrtPriceBX64] = BigNumberUtils.sort(
      sqrtPriceAX64,
      sqrtPriceBX64
    );

    if (sqrtPriceX64.isLessThanOrEqualTo(sqrtPriceAX64)) {
      return [
        LiquidityAmounts.getAmount0ForLiquidity({
          sqrtPriceAX64: sqrtPriceAX64,
          sqrtPriceBX64: sqrtPriceBX64,
          liquidity,
        }),
        0n,
      ];
    } else if (sqrtPriceX64.isLessThan(sqrtPriceBX64)) {
      const amount0 = LiquidityAmounts.getAmount0ForLiquidity({
        sqrtPriceAX64: sqrtPriceX64,
        sqrtPriceBX64: sqrtPriceBX64,
        liquidity,
      });

      const amount1 = LiquidityAmounts.getAmount1ForLiquidity({
        sqrtPriceAX64: sqrtPriceAX64,
        sqrtPriceBX64: sqrtPriceX64,
        liquidity,
      });

      return [amount0, amount1];
    } else {
      return [
        0n,
        LiquidityAmounts.getAmount1ForLiquidity({
          sqrtPriceAX64: sqrtPriceAX64,
          sqrtPriceBX64: sqrtPriceBX64,
          liquidity,
        }),
      ];
    }
  }
}
