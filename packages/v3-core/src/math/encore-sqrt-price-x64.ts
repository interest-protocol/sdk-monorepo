import BigNumber from '../lib/big-number';
import { shiftLeft } from '../lib/big-number';
import { EncodeSqrtPriceX64Args } from './math.types';

export const encoreSqrtPriceX64 = ({
  amount0,
  amount1,
}: EncodeSqrtPriceX64Args) => {
  const numerator = shiftLeft(new BigNumber(amount1), 128);

  const denominator = new BigNumber(amount0);

  const ratioX128 = numerator.div(denominator);

  return ratioX128.sqrt().integerValue(BigNumber.ROUND_DOWN);
};
