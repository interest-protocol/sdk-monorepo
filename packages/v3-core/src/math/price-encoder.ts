import { BigNumber } from '@/lib';

import { EncodeSqrtPriceX64Args } from './math.types';

export abstract class PriceEncoder {
  static encodeSqrtPriceX64({
    amount0,
    amount1,
  }: EncodeSqrtPriceX64Args): bigint {
    const ratioX128 = (amount1 << 128n) / amount0;

    return BigInt(
      BigNumber(ratioX128.toString())
        .sqrt()
        .integerValue(BigNumber.ROUND_DOWN)
        .toString()
    );
  }
}
