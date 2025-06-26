import invariant from 'tiny-invariant';

import { Q64 } from '@/constants';
import { BigNumber, BigNumberUtils, Decimal } from '@/lib';

import {
  GetAmount0ForLiquidityArgs,
  GetAmount1ForLiquidityArgs,
  GetAmountsArgs,
  GetAmountsForLiquidityArgs,
  GetAmountsForLiquidityEstimatedArgs,
  GetLiquidityForAmount0Args,
  GetLiquidityForAmount1Args,
  GetLiquidityForAmountsArgs,
} from './math.types';
import { TickMath } from './tick-math';

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

  static #getAmountsForLiquidityEstimated({
    liquidity,
    currentSqrtPriceX64,
    lowerSqrtPriceX64,
    upperSqrtPriceX64,
    roundUp,
  }: GetAmountsForLiquidityEstimatedArgs): [bigint, bigint] {
    const currentSqrtPriceX64BN = new Decimal(currentSqrtPriceX64.toString());
    const lowerSqrtPriceX64BN = new Decimal(lowerSqrtPriceX64.toString());
    const upperSqrtPriceX64BN = new Decimal(upperSqrtPriceX64.toString());
    const liquidityBN = new Decimal(liquidity.toString());

    let amount0 = new Decimal(0);
    let amount1 = new Decimal(0);

    if (currentSqrtPriceX64BN.lessThanOrEqualTo(lowerSqrtPriceX64BN)) {
      amount0 = liquidityBN
        .mul(Q64.toString())
        .mul(upperSqrtPriceX64BN.sub(lowerSqrtPriceX64BN))
        .div(lowerSqrtPriceX64BN.mul(upperSqrtPriceX64BN));
    } else if (currentSqrtPriceX64BN.lessThan(upperSqrtPriceX64BN)) {
      amount0 = liquidityBN
        .mul(Q64.toString())
        .mul(upperSqrtPriceX64BN.sub(currentSqrtPriceX64BN))
        .div(currentSqrtPriceX64BN.mul(upperSqrtPriceX64BN));

      amount1 = liquidityBN
        .mul(currentSqrtPriceX64BN.sub(lowerSqrtPriceX64BN))
        .div(Q64.toString());
    } else {
      amount1 = liquidityBN
        .mul(upperSqrtPriceX64BN.sub(lowerSqrtPriceX64BN))
        .div(Q64.toString());
    }

    return [
      BigNumberUtils.toBigInt(
        roundUp
          ? Decimal.ceil(amount0).toString()
          : Decimal.floor(amount0).toString()
      ),
      BigNumberUtils.toBigInt(
        roundUp
          ? Decimal.ceil(amount1).toString()
          : Decimal.floor(amount1).toString()
      ),
    ];
  }

  static getAmounts({
    slippage,
    lowerTick,
    upperTick,
    currentSqrtPriceX64,
    isAmount0,
    amount,
    roundUp,
  }: GetAmountsArgs) {
    const rounding = roundUp ? BigNumber.ROUND_UP : BigNumber.ROUND_DOWN;

    const lowerSqrtPriceX64 = TickMath.getSqrtRatioAtTick(lowerTick);
    const upperSqrtPriceX64 = TickMath.getSqrtRatioAtTick(upperTick);
    const currentTick = TickMath.getTickAtSqrtRatio(
      BigNumberUtils.toBigInt(currentSqrtPriceX64, rounding)
    );

    let liquidity;

    if (currentTick < lowerTick) {
      invariant(
        isAmount0,
        'You can only provide Token B when you are above the range'
      );
      liquidity = LiquidityAmounts.getLiquidityForAmount0({
        sqrtPriceAX64: lowerSqrtPriceX64,
        sqrtPriceBX64: upperSqrtPriceX64,
        amount0: amount,
      });

      const maxAmount0 = roundUp
        ? new Decimal(amount.toString()).mul(1 + slippage).toString()
        : new Decimal(amount.toString()).mul(1 - slippage).toString();

      return {
        amount0: amount,
        amount1: 0n,
        maxAmount0: BigNumberUtils.toBigInt(
          roundUp
            ? Decimal.ceil(maxAmount0).toString()
            : Decimal.floor(maxAmount0).toString(),
          rounding
        ),
        maxAmount1: 0n,
        liquidity,
        fixed0: isAmount0,
      };
    } else if (currentTick > upperTick) {
      invariant(
        !isAmount0,
        'You can only provide Token A when you are within the range'
      );
      liquidity = LiquidityAmounts.getLiquidityForAmount1({
        sqrtPriceAX64: lowerSqrtPriceX64,
        sqrtPriceBX64: upperSqrtPriceX64,
        amount1: amount,
      });

      const maxAmount1 = roundUp
        ? new Decimal(amount.toString()).mul(1 + slippage).toString()
        : new Decimal(amount.toString()).mul(1 - slippage).toString();

      return {
        amount0: 0n,
        amount1: amount,
        maxAmount0: 0n,
        maxAmount1: BigNumberUtils.toBigInt(
          roundUp
            ? Decimal.ceil(maxAmount1).toString()
            : Decimal.floor(maxAmount1).toString()
        ),
        liquidity,
        fixed0: isAmount0,
      };
    } else {
      liquidity = isAmount0
        ? LiquidityAmounts.getLiquidityForAmount0({
            sqrtPriceAX64: currentSqrtPriceX64,
            sqrtPriceBX64: upperSqrtPriceX64,
            amount0: amount,
          })
        : LiquidityAmounts.getLiquidityForAmount1({
            sqrtPriceAX64: currentSqrtPriceX64,
            sqrtPriceBX64: lowerSqrtPriceX64,
            amount1: amount,
          });
    }

    const amounts = LiquidityAmounts.#getAmountsForLiquidityEstimated({
      currentSqrtPriceX64: BigNumberUtils.toBigInt(
        currentSqrtPriceX64,
        rounding
      ),
      lowerSqrtPriceX64,
      upperSqrtPriceX64,
      liquidity,
      roundUp,
    });

    const maxAmount0 = roundUp
      ? new Decimal(amounts[0].toString()).mul(1 + slippage).toString()
      : new Decimal(amounts[0].toString()).mul(1 - slippage).toString();

    const maxAmount1 = roundUp
      ? new Decimal(amounts[1].toString()).mul(1 + slippage).toString()
      : new Decimal(amounts[1].toString()).mul(1 - slippage).toString();

    return {
      amount0: amounts[0],
      amount1: amounts[1],
      maxAmount0: BigNumberUtils.toBigInt(
        roundUp
          ? Decimal.ceil(maxAmount0).toString()
          : Decimal.floor(maxAmount0).toString(),
        rounding
      ),
      maxAmount1: BigNumberUtils.toBigInt(
        roundUp
          ? Decimal.ceil(maxAmount1).toString()
          : Decimal.floor(maxAmount1).toString(),
        rounding
      ),
      liquidity,
      fixed0: isAmount0,
    };
  }
}
