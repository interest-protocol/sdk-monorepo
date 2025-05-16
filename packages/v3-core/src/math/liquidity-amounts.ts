import invariant from 'tiny-invariant';

import { Q64, Zero } from '@/constants';
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
  }: GetLiquidityForAmount0Args) {
    const amount0BN = new BigNumber(amount0);

    const [sqrtPriceAX64Bn, sqrtPriceBX64Bn] = BigNumberUtils.sort(
      new BigNumber(sqrtPriceAX64),
      new BigNumber(sqrtPriceBX64)
    );

    invariant(sqrtPriceAX64Bn && sqrtPriceBX64Bn);

    const intermediate = sqrtPriceAX64Bn.multipliedBy(sqrtPriceBX64Bn).div(Q64);

    return amount0BN
      .multipliedBy(intermediate)
      .div(sqrtPriceBX64Bn.minus(sqrtPriceAX64Bn));
  }

  static getLiquidityForAmount1({
    sqrtPriceAX64,
    sqrtPriceBX64,
    amount1,
  }: GetLiquidityForAmount1Args) {
    const amount1BN = new BigNumber(amount1);

    const [sqrtPriceAX64Bn, sqrtPriceBX64Bn] = BigNumberUtils.sort(
      new BigNumber(sqrtPriceAX64),
      new BigNumber(sqrtPriceBX64)
    );

    invariant(sqrtPriceAX64Bn && sqrtPriceBX64Bn);

    return amount1BN
      .multipliedBy(Q64)
      .div(sqrtPriceBX64Bn.minus(sqrtPriceAX64Bn));
  }

  static getLiquidityForAmounts({
    sqrtPriceX64,
    sqrtPriceAX64,
    sqrtPriceBX64,
    amount0,
    amount1,
  }: GetLiquidityForAmountsArgs) {
    const sqrtPriceX64BN = new BigNumber(sqrtPriceX64);

    const [sqrtPriceAX64Bn, sqrtPriceBX64Bn] = BigNumberUtils.sort(
      new BigNumber(sqrtPriceAX64),
      new BigNumber(sqrtPriceBX64)
    );

    invariant(sqrtPriceAX64Bn && sqrtPriceBX64Bn);

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

      return BigNumberUtils.min(liquidity0, liquidity1);
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
  }: GetAmount0ForLiquidityArgs) {
    const [sqrtPriceAX64Bn, sqrtPriceBX64Bn] = BigNumberUtils.sort(
      new BigNumber(sqrtPriceAX64),
      new BigNumber(sqrtPriceBX64)
    );

    invariant(sqrtPriceAX64Bn && sqrtPriceBX64Bn);

    return BigNumberUtils.shiftLeft(new BigNumber(liquidity), 64)
      .multipliedBy(sqrtPriceBX64Bn.minus(sqrtPriceAX64Bn))
      .div(sqrtPriceBX64Bn.div(sqrtPriceAX64Bn));
  }

  static getAmount1ForLiquidity({
    sqrtPriceAX64,
    sqrtPriceBX64,
    liquidity,
  }: GetAmount1ForLiquidityArgs) {
    const [sqrtPriceAX64Bn, sqrtPriceBX64Bn] = BigNumberUtils.sort(
      new BigNumber(sqrtPriceAX64),
      new BigNumber(sqrtPriceBX64)
    );

    invariant(sqrtPriceAX64Bn && sqrtPriceBX64Bn);

    return new BigNumber(liquidity)
      .multipliedBy(sqrtPriceBX64Bn.minus(sqrtPriceAX64Bn))
      .div(Q64);
  }

  static getAmountsForLiquidity({
    sqrtPriceX64,
    sqrtPriceAX64,
    sqrtPriceBX64,
    liquidity,
  }: GetAmountsForLiquidityArgs) {
    const sqrtPriceX64BN = new BigNumber(sqrtPriceX64);

    const [sqrtPriceAX64Bn, sqrtPriceBX64Bn] = BigNumberUtils.sort(
      new BigNumber(sqrtPriceAX64),
      new BigNumber(sqrtPriceBX64)
    );

    invariant(sqrtPriceAX64Bn && sqrtPriceBX64Bn);

    if (sqrtPriceX64BN.isLessThanOrEqualTo(sqrtPriceAX64Bn)) {
      return [
        LiquidityAmounts.getAmount0ForLiquidity({
          sqrtPriceAX64: sqrtPriceAX64Bn,
          sqrtPriceBX64: sqrtPriceBX64Bn,
          liquidity,
        }),
        Zero,
      ];
    } else if (sqrtPriceX64BN.isLessThan(sqrtPriceBX64Bn)) {
      const amount0 = LiquidityAmounts.getAmount0ForLiquidity({
        sqrtPriceAX64: sqrtPriceX64BN,
        sqrtPriceBX64: sqrtPriceBX64Bn,
        liquidity,
      });

      const amount1 = LiquidityAmounts.getAmount1ForLiquidity({
        sqrtPriceAX64: sqrtPriceAX64Bn,
        sqrtPriceBX64: sqrtPriceX64BN,
        liquidity,
      });

      return [amount0, amount1];
    } else {
      return [
        Zero,
        LiquidityAmounts.getAmount1ForLiquidity({
          sqrtPriceAX64: sqrtPriceAX64Bn,
          sqrtPriceBX64: sqrtPriceBX64Bn,
          liquidity,
        }),
      ];
    }
  }
}
