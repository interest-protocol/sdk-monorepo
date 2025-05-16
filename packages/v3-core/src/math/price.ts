import { BigNumber, BigNumberUtils } from '@/lib';

import { Numberish } from '../types';
import { EncodeAmountsSqrtPriceX64Args } from './math.types';

export abstract class Price {
  static encodeAmountsSqrtX64({
    amount0,
    amount1,
  }: EncodeAmountsSqrtPriceX64Args) {
    const numerator = BigNumberUtils.shiftLeft(new BigNumber(amount1), 128);

    const denominator = new BigNumber(amount0);

    const ratioX128 = numerator.div(denominator);

    return ratioX128.sqrt().integerValue(BigNumber.ROUND_DOWN);
  }

  static encodeSqrtX64(amount: Numberish) {
    const value = BigNumberUtils.shiftLeft(new BigNumber(amount), 128);

    return value.sqrt().integerValue(BigNumber.ROUND_DOWN);
  }
}
