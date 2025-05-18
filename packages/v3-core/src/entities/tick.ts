import invariant from 'tiny-invariant';

import { BigNumberUtils } from '@/lib';
import { TickMath } from '@/math';
import { Numberish } from '@/types';

interface TickConstructorArgs {
  index: number;
  liquidityGross: Numberish;
  liquidityNet: Numberish;
  rewardsGrowthOutsideX64?: Numberish[];
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

  constructor({
    index,
    liquidityGross,
    liquidityNet,
    rewardsGrowthOutsideX64 = [],
  }: TickConstructorArgs) {
    invariant(index >= TickMath.MIN_TICK && index <= TickMath.MAX_TICK, 'TICK');
    this.index = index;
    this.liquidityGross = BigNumberUtils.toBigInt(liquidityGross);
    this.liquidityNet = BigNumberUtils.toBigInt(liquidityNet);
    this.rewardsGrowthOutsideX64 = rewardsGrowthOutsideX64.map((value) =>
      BigNumberUtils.toBigInt(value)
    );
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
