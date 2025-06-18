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

export const toBigNumber = (x: Numberish) => {
  if (typeof x === 'bigint') return new BigNumber(x.toString());
  if (typeof x === 'number') return new BigNumber(x);
  if (typeof x === 'string') return new BigNumber(x);
  if (x instanceof BigNumber) return x;
  throw new Error('Invalid input');
};

export const fromI32 = (value: string) =>
  fromInt(value, 0xffffffffn, 0x80000000n);

export const fromI64 = (value: string) =>
  fromInt(value, 0xffffffffffffffffn, 0x8000000000000000n);

export const fromI128 = (value: string) =>
  fromInt(
    value,
    0xffffffffffffffffffffffffffffffffn,
    0x80000000000000000000000000000000n
  );

export const fromI256 = (value: string) =>
  fromInt(
    value,
    0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn,
    0x8000000000000000000000000000000000000000000000000000000000000000n
  );

const fromInt = (value: string, maxValue: bigint, minNegative: bigint) => {
  const x = BigInt(value);
  const isPositive = minNegative > x;
  return isPositive ? new BigNumber(x) : new BigNumber(x - (maxValue + 1n));
};

const willOverflow = (x: Numberish, y: Numberish) =>
  MaxUint256.dividedBy(toBigNumber(y)).lt(toBigNumber(x));

export const shiftLeft = (amount: Numberish, shift: number) =>
  toBigNumber(amount).multipliedBy(toBigNumber(2).pow(shift));

export const shiftRight = (amount: Numberish, shift: number) =>
  toBigNumber(amount).dividedBy(toBigNumber(2).pow(shift));

export const sort = (x: Numberish, y: Numberish): [BigNumber, BigNumber] =>
  toBigNumber(x).gt(toBigNumber(y))
    ? [toBigNumber(y), toBigNumber(x)]
    : [toBigNumber(x), toBigNumber(y)];

export const min = (x: Numberish, y: Numberish) =>
  toBigNumber(x).lt(toBigNumber(y)) ? toBigNumber(x) : toBigNumber(y);

export const bitwiseOr = (a: BigNumber, b: BigNumber) => {
  // Convert BigNumber to BigInt, perform OR, then back to BigNumber
  const aBigInt = BigInt(a.toString());
  const bBigInt = BigInt(b.toString());
  const resultBigInt = aBigInt | bBigInt;

  return toBigNumber(resultBigInt.toString());
};

export const divUp = (a: Numberish, b: Numberish) => {
  a = toBigNumber(a);
  const result = a.dividedBy(b);

  if (a.mod(b).isZero()) return result;

  return result.plus(One);
};

export const tryMul = (x: Numberish, y: Numberish): [boolean, BigNumber] => {
  if (toBigNumber(y).isZero() || toBigNumber(x).isZero()) return [true, Zero];

  if (willOverflow(x, y)) return [false, Zero];

  return [true, toBigNumber(x).multipliedBy(toBigNumber(y))];
};

export const wrappingAdd = (x: Numberish, y: Numberish) =>
  toBigNumber(x).gt(MaxUint256.minus(toBigNumber(y)))
    ? toBigNumber(x)
        .minus(MaxUint256.minus(toBigNumber(y)))
        .minus(One)
    : toBigNumber(x).plus(toBigNumber(y));

export const wrappingSub = (x: Numberish, y: Numberish, maxValue: Numberish) =>
  toBigNumber(y).gt(toBigNumber(x))
    ? toBigNumber(maxValue).minus(toBigNumber(y)).plus(toBigNumber(x)).plus(One)
    : toBigNumber(x).minus(toBigNumber(y));

export const assertNotZero = (
  x: Numberish,
  msg = 'BigNumber must be greater than 0'
) => {
  invariant(!toBigNumber(x).isZero(), msg);
};

export const toBigInt = (
  x: Numberish,
  rounding: BigNumber.RoundingMode = BigNumber.ROUND_DOWN
) => BigInt(toBigNumber(x).integerValue(rounding).toString());

export default BigNumber;
