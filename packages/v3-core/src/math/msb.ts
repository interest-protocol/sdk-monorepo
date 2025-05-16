import invariant from 'tiny-invariant';

import { MaxUint256 } from '@/constants';
import { BigNumber, BigNumberUtils } from '@/lib';

import { Numberish } from '../types';

const TWO = new BigNumber(2);
const POWERS_OF_2 = [128, 64, 32, 16, 8, 4, 2, 1].map(
  (pow: number): [number, BigNumber] => [pow, TWO.pow(pow)]
);

export function mostSignificantBit(x: Numberish): number {
  let value = new BigNumber(x);

  invariant(value.gt(0), 'msb: value must be greater than 0');
  invariant(
    value.lte(MaxUint256),
    'msb: value must be less than or equal to MaxUint256'
  );

  let msb: number = 0;
  for (const [power, min] of POWERS_OF_2) {
    if (value.gte(min)) {
      value = BigNumberUtils.shiftRight(value, power);
      msb += power;
    }
  }
  return msb;
}
