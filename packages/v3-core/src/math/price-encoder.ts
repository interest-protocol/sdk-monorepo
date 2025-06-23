import { BigNumber, BigNumberUtils } from '@/lib';

import {
  PriceEncoderFromAmountsArgs,
  PriceEncoderToPriceArgs,
} from './math.types';

export abstract class PriceEncoder {
  static fromAmounts({
    amount0,
    amount1,
  }: PriceEncoderFromAmountsArgs): bigint {
    return BigNumberUtils.toBigInt(
      BigNumber((amount1 << 128n) / amount0).sqrt()
    );
  }

  static fromPrice(price: BigNumber): bigint {
    return BigNumberUtils.toBigInt(BigNumberUtils.shiftLeft(price, 128).sqrt());
  }

  // Decode back to price ratio (amount1/amount0)
  static toPrice({
    sqrtPriceX64,
    token0Decimals,
    token1Decimals,
  }: PriceEncoderToPriceArgs): BigNumber {
    // sqrtPriceX64 = sqrt((amount1 << 128) / amount0)
    // So: (sqrtPriceX64)^2 = (amount1 << 128) / amount0
    // Therefore: price = amount1/amount0 = (sqrtPriceX64)^2 / (2^128)

    const sqrtPriceSquared = BigNumber(sqrtPriceX64.toString()).pow(2);
    const scale = BigNumber(2).pow(128);
    const rawPrice = sqrtPriceSquared.div(scale);

    const decimalDiff = token0Decimals - token1Decimals;

    if (decimalDiff >= 0) {
      // token0 has more or equal decimals
      const decimalAdjustment = BigNumber(10).pow(decimalDiff);
      return rawPrice.multipliedBy(decimalAdjustment);
    } else {
      // token1 has more decimals (negative difference)
      const decimalAdjustment = BigNumber(10).pow(Math.abs(decimalDiff));
      return rawPrice.div(decimalAdjustment);
    }
  }
}
