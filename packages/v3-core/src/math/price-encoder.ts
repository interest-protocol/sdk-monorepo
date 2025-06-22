import { BigNumber, BigNumberUtils } from '@/lib';

import { EncodeSqrtPriceX64Args } from './math.types';

export abstract class PriceEncoder {
  static encodeSqrtPriceX64({
    amount0,
    amount1,
    decimals0,
    decimals1,
  }: EncodeSqrtPriceX64Args): bigint {
    const amount0Scaled = (amount0 * 10n ** 8n) / 10n ** BigInt(decimals0);
    const amount1Scaled = (amount1 * 10n ** 8n) / 10n ** BigInt(decimals1);

    return BigNumberUtils.toBigInt(
      BigNumber((amount1Scaled << 128n) / amount0Scaled).sqrt()
    );
  }

  // Decode back to price ratio (amount1/amount0)
  static decodeSqrtPriceX64ToPrice(sqrtPriceX64: bigint): BigNumber {
    // sqrtPriceX64 = sqrt((amount1 << 128) / amount0)
    // So: (sqrtPriceX64)^2 = (amount1 << 128) / amount0
    // Therefore: price = amount1/amount0 = (sqrtPriceX64)^2 / (2^128)

    const sqrtPriceSquared = BigNumber(sqrtPriceX64.toString()).pow(2);
    const scale = BigNumber(2).pow(128);
    return sqrtPriceSquared.div(scale);
  }
}
