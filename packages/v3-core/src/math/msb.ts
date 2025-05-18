import invariant from 'tiny-invariant';

import { MaxUint256 } from '@/constants';
import { BigNumberUtils } from '@/lib';

export function mostSignificantBit(x: bigint): number {
  invariant(x > 0n, 'msb: ZERO');
  invariant(x <= BigNumberUtils.toBigInt(MaxUint256), 'msb: MAX');

  return x.toString(2).length - 1;
}
