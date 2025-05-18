import { Rounding } from '@/constants';
import { PriceEncoder, TickMath } from '@/math';

import { FromTickArgs } from '../lib/types';
import { Fraction } from './fraction';
import { Token } from './token';

const Q128 = 1n << 128n;

export class Price extends Fraction {
  #scalar: Fraction;
  #isSorted: boolean;

  constructor(
    readonly baseToken: Token,
    readonly quoteToken: Token,
    amount0: bigint,
    amount1: bigint
  ) {
    super(amount1, amount0);
    this.#isSorted = baseToken.sortsBefore(quoteToken);
    this.#scalar = new Fraction(
      10 ** baseToken.decimals,
      10 ** quoteToken.decimals
    );
  }

  public toSignificant(
    significantDigits: number = 6,
    rounding = Rounding.ROUND_HALF_UP
  ): string {
    return this.adjustedForDecimals.toSignificant(significantDigits, rounding);
  }

  static fromTick({ tick, baseToken, quoteToken }: FromTickArgs): Price {
    const sqrtRatioX64 = TickMath.getSqrtRatioAtTick(tick);
    const sqrtRatio128 = sqrtRatioX64 * sqrtRatioX64;
    const isSorted = baseToken.sortsBefore(quoteToken);

    const numerator = isSorted ? Q128 : sqrtRatio128;
    const denominator = isSorted ? sqrtRatio128 : Q128;

    return new Price(baseToken, quoteToken, numerator, denominator);
  }

  public toClosestTick(): number {
    const sqrtRatioX64 = this.#isSorted
      ? PriceEncoder.encodeSqrtPriceX64({
          amount0: this.denominator,
          amount1: this.numerator,
        })
      : PriceEncoder.encodeSqrtPriceX64({
          amount0: this.numerator,
          amount1: this.denominator,
        });

    let tick = TickMath.getTickAtSqrtRatio(sqrtRatioX64);

    const nextTick = Price.fromTick({
      tick: tick + 1,
      baseToken: this.baseToken,
      quoteToken: this.quoteToken,
    });

    if (this.#isSorted) {
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

  private get adjustedForDecimals(): Fraction {
    return super.multiply(this.#scalar);
  }
}
