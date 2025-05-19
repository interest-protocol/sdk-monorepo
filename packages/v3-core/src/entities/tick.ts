import invariant from 'tiny-invariant';

import { BigNumberUtils } from '@/lib';
import { TickMath } from '@/math';
import { Numberish } from '@/types';

interface TickConstructorArgs {
  index: number;
  liquidityGross: Numberish;
  liquidityNet: Numberish;
  rewardsGrowthOutsideX64?: Numberish[];
  feeGrowthOutside0X64?: Numberish;
  feeGrowthOutside1X64?: Numberish;
  tickCumulativeOutside?: Numberish;
  secondsPerLiquidityOutsideX64?: Numberish;
  secondsOutside?: Numberish;
}

export interface NearestUsableTickArgs {
  tick: number;
  tickSpacing: number;
}

export class Tick {
  public readonly index: number;
  public readonly liquidityGross: bigint;
  public readonly liquidityNet: bigint;
  public readonly rewardsGrowthOutsideX64: bigint[];
  public readonly feeGrowthOutside0X64: bigint;
  public readonly feeGrowthOutside1X64: bigint;
  public readonly tickCumulativeOutside: bigint;
  public readonly secondsPerLiquidityOutsideX64: bigint;
  public readonly secondsOutside: bigint;

  constructor({
    index,
    liquidityGross,
    liquidityNet,
    rewardsGrowthOutsideX64 = [],
    feeGrowthOutside0X64 = 0n,
    feeGrowthOutside1X64 = 0n,
    tickCumulativeOutside = 0n,
    secondsPerLiquidityOutsideX64 = 0n,
    secondsOutside = 0n,
  }: TickConstructorArgs) {
    invariant(index >= TickMath.MIN_TICK && index <= TickMath.MAX_TICK, 'TICK');
    this.index = index;
    this.liquidityGross = BigNumberUtils.toBigInt(liquidityGross);
    this.liquidityNet = BigNumberUtils.toBigInt(liquidityNet);
    this.rewardsGrowthOutsideX64 = rewardsGrowthOutsideX64.map((value) =>
      BigNumberUtils.toBigInt(value)
    );
    this.feeGrowthOutside0X64 = BigNumberUtils.toBigInt(feeGrowthOutside0X64);
    this.feeGrowthOutside1X64 = BigNumberUtils.toBigInt(feeGrowthOutside1X64);
    this.tickCumulativeOutside = BigNumberUtils.toBigInt(tickCumulativeOutside);
    this.secondsPerLiquidityOutsideX64 = BigNumberUtils.toBigInt(
      secondsPerLiquidityOutsideX64
    );
    this.secondsOutside = BigNumberUtils.toBigInt(secondsOutside);
  }

  public static nearestUsableTick({
    tick,
    tickSpacing,
  }: NearestUsableTickArgs) {
    invariant(
      Number.isInteger(tick) && Number.isInteger(tickSpacing),
      'nearestUsableTick: INTEGERS'
    );
    invariant(tickSpacing > 0, 'nearestUsableTick: TICK_SPACING');
    invariant(
      tick >= TickMath.MIN_TICK && tick <= TickMath.MAX_TICK,
      'nearestUsableTick: tick must be between MIN_TICK and MAX_TICK'
    );

    const rounded = Math.round(tick / tickSpacing) * tickSpacing;

    if (rounded < TickMath.MIN_TICK) return rounded + tickSpacing;
    else if (rounded > TickMath.MAX_TICK) return rounded - tickSpacing;
    else return rounded;
  }
}
