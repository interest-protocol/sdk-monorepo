import { BigNumber } from 'bignumber.js';

export const MaxUint256 = new BigNumber(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);

export const MaxUint128 = new BigNumber('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');

export const Q128 = new BigNumber(2n ** 128n);

export const Q64 = new BigNumber(2n ** 64n);

export const Q32 = new BigNumber(2n ** 32n);

export const Two = new BigNumber(2);

export const One = new BigNumber(1);

export const Zero = new BigNumber(0);

export const Rounding = {
  ROUND_DOWN: 0,
  ROUND_HALF_UP: 1,
  ROUND_UP: 2,
};
