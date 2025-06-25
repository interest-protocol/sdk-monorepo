import { BigNumber } from 'bignumber.js';

export const MaxUint256 = new BigNumber(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);

export const MaxUint128 = new BigNumber('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');

export const MaxUint64 = new BigNumber('0xFFFFFFFFFFFFFFFF');

export const Q128 = new BigNumber(2n ** 128n);

export const Q64 = new BigNumber(2n ** 64n);

export const Q32 = new BigNumber(2n ** 32n);

export const Two = new BigNumber(2);

export const One = new BigNumber(1);

export const Zero = new BigNumber(0);

export const MAX_TICK = 443636;

export const MIN_TICK = -MAX_TICK;

export const MIN_SQRT_PRICE_X64 = new BigNumber(4295048016);

export const MAX_SQRT_PRICE_X64 = new BigNumber(
  '79226673515401279992447579061'
);

export const Rounding = {
  ROUND_DOWN: 0,
  ROUND_HALF_UP: 1,
  ROUND_UP: 2,
};
