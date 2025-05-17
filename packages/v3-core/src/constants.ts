import BigNumber from './lib/big-number';

export const MaxUint256 = BigNumber(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);

export const Q128 = new BigNumber('0x100000000000000000000000000000000');

export const Q64 = new BigNumber('0x10000000000000000');

export const Q32 = new BigNumber(2).pow(32);

export const One = new BigNumber(1);

export const Two = new BigNumber(2);

export const Zero = new BigNumber(0);
