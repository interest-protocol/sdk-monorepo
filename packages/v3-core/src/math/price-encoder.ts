import { BigNumber, BigNumberUtils } from '@/lib';

import {
  DecodeSqrtPriceX64ToPriceArgs,
  EncodeSqrtPriceX64Args,
} from './math.types';

export abstract class PriceEncoder {
  static encodeSqrtPriceX64({
    amount0,
    amount1,
  }: EncodeSqrtPriceX64Args): bigint {
    return BigNumberUtils.toBigInt(
      BigNumber((amount1 << 128n) / amount0).sqrt()
    );
  }

  // Decode back to price ratio (amount1/amount0)
  static decodeSqrtPriceX64ToPrice({
    sqrtPriceX64,
    token0Decimals,
    token1Decimals,
  }: DecodeSqrtPriceX64ToPriceArgs): BigNumber {
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
