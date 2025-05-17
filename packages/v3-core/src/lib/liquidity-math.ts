import BigNumber from './big-number';

export abstract class LiquidityMath {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static addDelta(x: BigNumber, y: BigNumber): BigNumber {
    if (y.isNegative()) {
      return x.minus(y.abs());
    } else {
      return x.plus(y);
    }
  }
}
