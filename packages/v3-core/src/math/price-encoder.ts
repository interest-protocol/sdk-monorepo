import { BigNumber } from '@/lib';

import {
  EncodeAmountsSqrtPriceX64Args,
  PriceFromAmountsArgs,
} from './math.types';

export abstract class PriceEncoder {
  static priceFromAmounts({ amount0, amount1 }: PriceFromAmountsArgs) {
    return amount1 / amount0;
  }

  static encodeAmountsSqrtX64({
    amount0,
    amount1,
  }: EncodeAmountsSqrtPriceX64Args) {
    const ratioX128 = (amount1 << 128n) / amount0;

    return BigInt(
      BigNumber(ratioX128.toString())
        .sqrt()
        .integerValue(BigNumber.ROUND_DOWN)
        .toString()
    );
  }

  static encodeSqrtX64(amount: bigint) {
    const value = amount << 128n;

    return BigInt(
      BigNumber(value.toString())
        .sqrt()
        .integerValue(BigNumber.ROUND_DOWN)
        .toString()
    );
  }

  static decodeSqrtX64(sqrtX64: bigint) {
    return (sqrtX64 * sqrtX64) >> 128n;
  }
}
