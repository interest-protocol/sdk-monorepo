import { Q64 } from '@/constants';
import { BigNumber, BigNumberUtils } from '@/lib';

import { GetTokensOwedArgs } from './types';

export abstract class PositionLibrary {
  public static getTokensOwed({
    liquidity,
    feeGrowthInside0X64,
    feeGrowthInside1X64,
    feeGrowthInside0LastX64,
    feeGrowthInside1LastX64,
  }: GetTokensOwedArgs): [bigint, bigint] {
    const tokensOwed0 = new BigNumber(feeGrowthInside0X64)
      .minus(new BigNumber(feeGrowthInside0LastX64))
      .multipliedBy(new BigNumber(liquidity))
      .dividedBy(Q64);

    const tokensOwed1 = new BigNumber(feeGrowthInside1X64)
      .minus(new BigNumber(feeGrowthInside1LastX64))
      .multipliedBy(new BigNumber(liquidity))
      .dividedBy(Q64);

    return [
      BigNumberUtils.toBigInt(tokensOwed0),
      BigNumberUtils.toBigInt(tokensOwed1),
    ];
  }
}
