import Decimal from 'decimal.js';

Decimal.config({
  precision: 500,
  rounding: Decimal.ROUND_DOWN,
  toExpNeg: -500,
  toExpPos: 500,
});

export default Decimal;
