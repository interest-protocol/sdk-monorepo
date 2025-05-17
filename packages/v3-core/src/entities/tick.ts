import invariant from 'tiny-invariant';

import { BigNumber } from '@/lib';
import { TickMath } from '@/math';
import { Numberish } from '@/types';

interface TickConstructorArgs {
  index: number;
  liquidityGross: Numberish;
  liquidityNet: Numberish;
  rewardsGrowthOutsideX64?: Numberish[];
}

export class Tick {
  public readonly index: number;
  public readonly liquidityGross: BigNumber;
  public readonly liquidityNet: BigNumber;
  public readonly rewardsGrowthOutsideX64: BigNumber[];

  constructor({
    index,
    liquidityGross,
    liquidityNet,
    rewardsGrowthOutsideX64 = [],
  }: TickConstructorArgs) {
    invariant(index >= TickMath.MIN_TICK && index <= TickMath.MAX_TICK, 'TICK');
    this.index = index;
    this.liquidityGross = new BigNumber(liquidityGross);
    this.liquidityNet = new BigNumber(liquidityNet);
    this.rewardsGrowthOutsideX64 = rewardsGrowthOutsideX64.map(
      (value) => new BigNumber(value)
    );
  }
}
