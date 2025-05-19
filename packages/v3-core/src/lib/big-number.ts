import BigNumber from 'bignumber.js';
import invariant from 'tiny-invariant';

import { MaxUint256, One, Zero } from '@/constants';
import { Numberish } from '@/types';

// Configure for maximum precision
BigNumber.config({
  DECIMAL_PLACES: 49,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  POW_PRECISION: 49,
  EXPONENTIAL_AT: 1e9,
});

const willOverflow = (x: Numberish, y: Numberish) =>
  MaxUint256.dividedBy(new BigNumber(y)).lt(new BigNumber(x));

export const shiftLeft = (amount: Numberish, shift: number) =>
  new BigNumber(amount).multipliedBy(new BigNumber(2).pow(shift));

export const shiftRight = (amount: Numberish, shift: number) =>
  new BigNumber(amount).dividedBy(new BigNumber(2).pow(shift));

export const sort = (x: Numberish, y: Numberish): [BigNumber, BigNumber] =>
  new BigNumber(x).gt(new BigNumber(y))
    ? [new BigNumber(y), new BigNumber(x)]
    : [new BigNumber(x), new BigNumber(y)];

export const min = (x: Numberish, y: Numberish) =>
  new BigNumber(x).lt(new BigNumber(y)) ? new BigNumber(x) : new BigNumber(y);

export const bitwiseOr = (a: BigNumber, b: BigNumber) => {
  // Convert BigNumber to BigInt, perform OR, then back to BigNumber
  const aBigInt = BigInt(a.toString());
  const bBigInt = BigInt(b.toString());
  const resultBigInt = aBigInt | bBigInt;

  return new BigNumber(resultBigInt.toString());
};

export const divUp = (a: Numberish, b: Numberish) => {
  a = new BigNumber(a);
  const result = a.dividedBy(b);

  if (a.mod(b).isZero()) return result;

  return result.plus(One);
};

export const tryMul = (x: Numberish, y: Numberish): [boolean, BigNumber] => {
  if (new BigNumber(y).isZero() || new BigNumber(x).isZero())
    return [true, Zero];

  if (willOverflow(x, y)) return [false, Zero];

  return [true, new BigNumber(x).multipliedBy(new BigNumber(y))];
};

export const wrappingAdd = (x: Numberish, y: Numberish) =>
  new BigNumber(x).gt(MaxUint256.minus(new BigNumber(y)))
    ? new BigNumber(x).minus(MaxUint256.minus(new BigNumber(y))).minus(One)
    : new BigNumber(x).plus(new BigNumber(y));

export const wrappingSub = (x: Numberish, y: Numberish) =>
  new BigNumber(y).gt(new BigNumber(x))
    ? MaxUint256.minus(new BigNumber(y)).minus(new BigNumber(x)).plus(One)
    : new BigNumber(x).minus(new BigNumber(y));

export const assertNotZero = (
  x: Numberish,
  msg = 'BigNumber must be greater than 0'
) => {
  invariant(!new BigNumber(x).isZero(), msg);
};

export const toBigInt = (
  x: Numberish,
  rounding: BigNumber.RoundingMode = BigNumber.ROUND_DOWN
) => BigInt(new BigNumber(x).integerValue(rounding).toString());

export default BigNumber;
