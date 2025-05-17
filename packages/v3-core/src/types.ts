import BigNumber from './lib/big-number';

export type Numberish = bigint | number | string | BigNumber;

export interface NearestUsableTickArgs {
  tick: number;
  tickSpacing: number;
}

export interface GetTokensOwedArgs {
  liquidity: Numberish;
  feeGrowthInside0X64: Numberish;
  feeGrowthInside1X64: Numberish;
  feeGrowthInside0LastX64: Numberish;
  feeGrowthInside1LastX64: Numberish;
}

interface FeeGrowthTick {
  value: number;
  feeGrowthOutside0X64: Numberish;
  feeGrowthOutside1X64: Numberish;
}

export interface GetFeeGrowthInsideArgs {
  tickLower: FeeGrowthTick;
  tickUpper: FeeGrowthTick;
  tickCurrent: number;
  feeGrowthGlobal0X64: Numberish;
  feeGrowthGlobal1X64: Numberish;
}
