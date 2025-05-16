import BigNumber from 'bignumber.js';

// Configure for maximum precision
BigNumber.config({
  DECIMAL_PLACES: 49,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  POW_PRECISION: 49,
  EXPONENTIAL_AT: 1e9,
});

export const shiftLeft = (amount: BigNumber, shift: number) =>
  amount.multipliedBy(new BigNumber(2).pow(shift));

export const shiftRight = (amount: BigNumber, shift: number) =>
  amount.dividedBy(new BigNumber(2).pow(shift));

export const sort = (x: BigNumber, y: BigNumber) => (x.gt(y) ? [y, x] : [x, y]);

export const min = (x: BigNumber, y: BigNumber) => (x.lt(y) ? x : y);

export default BigNumber;
