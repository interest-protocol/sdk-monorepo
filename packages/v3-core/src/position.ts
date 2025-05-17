import { Q64 } from '@/constants';
import { BigNumber } from '@/lib';

import { GetTokensOwedArgs } from './types';

export abstract class PositionLibrary {
  public static getTokensOwed({
    liquidity,
    feeGrowthInside0X64,
    feeGrowthInside1X64,
    feeGrowthInside0LastX64,
    feeGrowthInside1LastX64,
  }: GetTokensOwedArgs): [BigNumber, BigNumber] {
    const tokensOwed0 = new BigNumber(feeGrowthInside0X64)
      .minus(new BigNumber(feeGrowthInside0LastX64))
      .multipliedBy(new BigNumber(liquidity))
      .dividedBy(Q64);

    const tokensOwed1 = new BigNumber(feeGrowthInside1X64)
      .minus(new BigNumber(feeGrowthInside1LastX64))
      .multipliedBy(new BigNumber(liquidity))
      .dividedBy(Q64);

    return [tokensOwed0, tokensOwed1];
  }
}
