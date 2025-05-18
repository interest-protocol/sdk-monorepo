import { BigNumber, BigNumberUtils } from '@/lib';

import { EncodeSqrtPriceX64Args } from './math.types';

export abstract class PriceEncoder {
  static encodeSqrtPriceX64({
    amount0,
    amount1,
  }: EncodeSqrtPriceX64Args): bigint {
    return BigNumberUtils.toBigInt(
      BigNumber((amount1 << 128n) / amount0).sqrt()
    );
  }
}
