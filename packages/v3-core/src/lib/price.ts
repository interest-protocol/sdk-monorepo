import { Q128 } from '@/constants';
import { PriceEncoder, TickMath } from '@/math';

import BigNumber from './big-number';
import { FromTickArgs } from './types';

export class Price {
  private constructor(
    readonly tokenA: string,
    readonly tokenB: string,
    readonly numerator: BigNumber,
    readonly denominator: BigNumber,
    readonly isSorted: boolean
  ) {}

  static fromTick({ tick, tokenA, tokenB }: FromTickArgs): Price {
    const sqrtRatioX64 = TickMath.getSqrtRatioAtTick(tick);
    const sqrtRatio128 = sqrtRatioX64.multipliedBy(sqrtRatioX64);
    const isSorted = tokenA.toLowerCase() < tokenB.toLowerCase();

    const numerator = isSorted ? Q128 : sqrtRatio128;
    const denominator = isSorted ? sqrtRatio128 : Q128;

    return new Price(tokenA, tokenB, numerator, denominator, isSorted);
  }

  public lessThan(other: Price): boolean {
    return this.numerator
      .multipliedBy(other.denominator)
      .lt(other.numerator.multipliedBy(this.denominator));
  }

  public greaterThan(other: Price): boolean {
    return this.numerator
      .multipliedBy(other.denominator)
      .gt(other.numerator.multipliedBy(this.denominator));
  }

  public toPriceClosestTick(price: Price): number {
    const sqrtRatioX64 = price.isSorted
      ? PriceEncoder.encodeAmountsSqrtX64({
          amount0: price.denominator,
          amount1: price.numerator,
        })
      : PriceEncoder.encodeAmountsSqrtX64({
          amount0: price.numerator,
          amount1: price.denominator,
        });

    let tick = TickMath.getTickAtSqrtRatio(sqrtRatioX64);

    const nextTick = Price.fromTick({
      tick: tick + 1,
      tokenA: price.tokenA,
      tokenB: price.tokenB,
    });

    if (this.isSorted) {
      if (!this.lessThan(nextTick)) {
        tick++;
      }
    } else {
      if (!this.greaterThan(nextTick)) {
        tick++;
      }
    }

    return tick;
  }
}
