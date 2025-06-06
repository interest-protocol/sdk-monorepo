import invariant from 'tiny-invariant';

import { Numberish } from '../types';
import BigNumber, { toBigInt } from './big-number';

export abstract class LiquidityMath {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static addDelta(x: Numberish, y: Numberish): bigint {
    x = new BigNumber(x);
    y = new BigNumber(y);

    if (y.isNegative()) {
      const r = x.minus(y.abs());
      invariant(r.isPositive(), 'LiquidityMath: addDelta: result is negative');
      return toBigInt(r);
    } else {
      const r = x.plus(y);
      invariant(r.isPositive(), 'LiquidityMath: addDelta: result is negative');
      return toBigInt(r);
    }
  }
}
