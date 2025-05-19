import { MaxUint128 } from '@/constants';
import { BigNumber, BigNumberUtils } from '@/lib';

import { GetFeeGrowthInsideArgs } from './types';

export abstract class TickLibrary {
  public static getFeeGrowthInside({
    tickLower,
    tickUpper,
    tickCurrent,
    feeGrowthGlobal0X64,
    feeGrowthGlobal1X64,
  }: GetFeeGrowthInsideArgs): [bigint, bigint] {
    feeGrowthGlobal0X64 = new BigNumber(feeGrowthGlobal0X64);
    feeGrowthGlobal1X64 = new BigNumber(feeGrowthGlobal1X64);

    const [feeGrowthBelow0X64, feeGrowthBelow1X64] =
      tickCurrent >= tickLower.value
        ? [tickLower.feeGrowthOutside0X64, tickLower.feeGrowthOutside1X64]
        : [
            BigNumberUtils.wrappingSub(
              feeGrowthGlobal0X64,
              tickLower.feeGrowthOutside0X64,
              MaxUint128
            ),
            BigNumberUtils.wrappingSub(
              feeGrowthGlobal1X64,
              tickLower.feeGrowthOutside1X64,
              MaxUint128
            ),
          ];

    const [feeGrowthAbove0X64, feeGrowthAbove1X64] =
      tickUpper.value > tickCurrent
        ? [tickUpper.feeGrowthOutside0X64, tickUpper.feeGrowthOutside1X64]
        : [
            BigNumberUtils.wrappingSub(
              feeGrowthGlobal0X64,
              tickUpper.feeGrowthOutside0X64,
              MaxUint128
            ),
            BigNumberUtils.wrappingSub(
              feeGrowthGlobal1X64,
              tickUpper.feeGrowthOutside1X64,
              MaxUint128
            ),
          ];

    return [
      BigNumberUtils.toBigInt(
        BigNumberUtils.wrappingSub(
          BigNumberUtils.wrappingSub(
            feeGrowthGlobal0X64,
            feeGrowthBelow0X64,
            MaxUint128
          ),
          feeGrowthAbove0X64,
          MaxUint128
        )
      ),
      BigNumberUtils.toBigInt(
        BigNumberUtils.wrappingSub(
          BigNumberUtils.wrappingSub(
            feeGrowthGlobal1X64,
            feeGrowthBelow1X64,
            MaxUint128
          ),
          feeGrowthAbove1X64,
          MaxUint128
        )
      ),
    ];
  }
}
