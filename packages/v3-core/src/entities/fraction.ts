import Big, { RoundingMode } from 'big.js';
import Decimal from 'decimal.js-light';
import invariant from 'tiny-invariant';

import { Rounding } from '@/constants';
import { BigNumber } from '@/lib';

import { Numberish } from '../types';

const toSignificantRounding = {
  [Rounding.ROUND_DOWN]: Decimal.ROUND_DOWN,
  [Rounding.ROUND_HALF_UP]: Decimal.ROUND_HALF_UP,
  [Rounding.ROUND_UP]: Decimal.ROUND_UP,
};

const toFixedRounding = {
  [Rounding.ROUND_DOWN]: 0,
  [Rounding.ROUND_HALF_UP]: 1,
  [Rounding.ROUND_UP]: 3,
};

export class Fraction {
  public readonly numerator: bigint;
  public readonly denominator: bigint;

  public constructor(numerator: Numberish, denominator: Numberish = 1n) {
    this.numerator = BigInt(numerator.toString());
    this.denominator = BigInt(denominator.toString());
  }

  private static tryParseFraction(fractionish: Numberish | Fraction): Fraction {
    if (
      fractionish instanceof BigNumber ||
      typeof fractionish === 'number' ||
      typeof fractionish === 'string' ||
      typeof fractionish === 'bigint'
    )
      return new Fraction(fractionish);

    if ('numerator' in fractionish && 'denominator' in fractionish)
      return fractionish;
    throw new Error('Could not parse fraction');
  }

  public get quotient(): bigint {
    return this.numerator / this.denominator;
  }

  // remainder after floor division
  public get remainder(): Fraction {
    return new Fraction(this.numerator % this.denominator, this.denominator);
  }

  public invert(): Fraction {
    return new Fraction(this.denominator, this.numerator);
  }

  public add(other: Fraction | Numberish): Fraction {
    const otherParsed = Fraction.tryParseFraction(other);
    if (this.denominator === otherParsed.denominator) {
      return new Fraction(
        this.numerator + otherParsed.numerator,
        this.denominator
      );
    }
    return new Fraction(
      this.numerator * otherParsed.denominator +
        otherParsed.numerator * this.denominator,
      this.denominator * otherParsed.denominator
    );
  }

  public subtract(other: Fraction | Numberish): Fraction {
    const otherParsed = Fraction.tryParseFraction(other);
    if (this.denominator === otherParsed.denominator) {
      return new Fraction(
        this.numerator - otherParsed.numerator,
        this.denominator
      );
    }
    return new Fraction(
      this.numerator * otherParsed.denominator -
        otherParsed.numerator * this.denominator,
      this.denominator * otherParsed.denominator
    );
  }

  public lessThan(other: Fraction | Numberish): boolean {
    const otherParsed = Fraction.tryParseFraction(other);
    return (
      this.numerator * otherParsed.denominator <
      otherParsed.numerator * this.denominator
    );
  }

  public equalTo(other: Fraction | Numberish): boolean {
    const otherParsed = Fraction.tryParseFraction(other);
    return (
      this.numerator * otherParsed.denominator ===
      otherParsed.numerator * this.denominator
    );
  }

  public greaterThan(other: Fraction | Numberish): boolean {
    const otherParsed = Fraction.tryParseFraction(other);
    return (
      this.numerator * otherParsed.denominator >
      otherParsed.numerator * this.denominator
    );
  }

  public multiply(other: Fraction | Numberish): Fraction {
    const otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(
      this.numerator * otherParsed.numerator,
      this.denominator * otherParsed.denominator
    );
  }

  public divide(other: Fraction | Numberish): Fraction {
    const otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(
      this.numerator * otherParsed.denominator,
      this.denominator * otherParsed.numerator
    );
  }

  public toSignificant(
    significantDigits: number,
    rounding = Rounding.ROUND_HALF_UP
  ): string {
    invariant(
      Number.isInteger(significantDigits),
      `${significantDigits} is not an integer.`
    );
    invariant(significantDigits > 0, `${significantDigits} is not positive.`);

    Decimal.set({
      precision: significantDigits + 1,
      rounding: toSignificantRounding[rounding],
    });

    const quotient = new Decimal(this.numerator.toString())
      .div(this.denominator.toString())
      .toSignificantDigits(significantDigits);

    return quotient.toString();
  }

  public toFixed(decimalPlaces: number, rounding: RoundingMode = 0): string {
    invariant(
      Number.isInteger(decimalPlaces),
      `${decimalPlaces} is not an integer.`
    );
    invariant(decimalPlaces >= 0, `${decimalPlaces} is negative.`);

    Big.DP = decimalPlaces;
    Big.RM = toFixedRounding[rounding] || 0;
    return new Big(this.numerator.toString())
      .div(this.denominator.toString())
      .toFixed(decimalPlaces);
  }

  /**
   * Helper method for converting any super class back to a fraction
   */
  public get asFraction(): Fraction {
    return new Fraction(this.numerator, this.denominator);
  }
}
