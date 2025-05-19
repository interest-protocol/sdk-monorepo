import invariant from 'tiny-invariant';

import { Tick } from '@/entities';
import { isSorted } from '@/lib';

import { Zero } from './constants';

function tickComparator(a: Tick, b: Tick) {
  return a.index - b.index;
}

export abstract class TickList {
  public static validate(tickList: Tick[], tickSpacing: number) {
    invariant(tickSpacing > 0, 'TickList: tickSpacing must be greater than 0');

    invariant(
      tickList.every((tick) => tick.index % tickSpacing === 0),
      'TickList: tickList must be evenly spaced'
    );

    invariant(
      tickList
        .reduce((acc, tick) => acc.plus(tick.liquidityNet), Zero)
        .isZero(),
      'TickList: tickList must have no net liquidity'
    );

    invariant(
      isSorted(tickList, tickComparator),
      'TickList: tickList must be sorted'
    );
  }

  public static isBelowSmallest(ticks: readonly Tick[], tick: number): boolean {
    invariant(ticks.length > 0 && ticks[0], 'TickList: length');
    return tick < ticks[0].index;
  }

  public static isAtOrAboveLargest(
    ticks: readonly Tick[],
    tick: number
  ): boolean {
    invariant(ticks.length > 0 && ticks[ticks.length - 1], 'LENGTH');
    return tick >= ticks[ticks.length - 1]!.index;
  }

  public static getTick(ticks: readonly Tick[], index: number): Tick {
    const tick = ticks[this.binarySearch(ticks, index)];
    invariant(tick && tick.index === index, 'TickList: not contained');
    return tick;
  }

  public static nextInitializedTick(
    ticks: readonly Tick[],
    tick: number,
    lte: boolean
  ): Tick {
    if (lte) {
      invariant(
        !this.isBelowSmallest(ticks, tick),
        'TickList: is below smallest'
      );
      if (this.isAtOrAboveLargest(ticks, tick)) {
        return ticks[ticks.length - 1]!;
      }
      const index = this.binarySearch(ticks, tick);
      return ticks[index]!;
    } else {
      invariant(
        !this.isAtOrAboveLargest(ticks, tick),
        'TickList: is at or above largest'
      );
      if (this.isBelowSmallest(ticks, tick)) {
        return ticks[0]!;
      }
      const index = this.binarySearch(ticks, tick);
      return ticks[index + 1]!;
    }
  }

  public static nextInitializedTickWithinOneWord(
    ticks: readonly Tick[],
    tick: number,
    lte: boolean,
    tickSpacing: number
  ): [number, boolean] {
    const compressed = Math.floor(tick / tickSpacing); // matches rounding in the code

    if (lte) {
      const wordPos = compressed >> 8;
      const minimum = (wordPos << 8) * tickSpacing;

      if (TickList.isBelowSmallest(ticks, tick)) {
        return [minimum, false];
      }

      const index = TickList.nextInitializedTick(ticks, tick, lte).index;
      const nextInitializedTick = Math.max(minimum, index);
      return [nextInitializedTick, nextInitializedTick === index];
    } else {
      const wordPos = (compressed + 1) >> 8;
      const maximum = (((wordPos + 1) << 8) - 1) * tickSpacing;

      if (this.isAtOrAboveLargest(ticks, tick)) {
        return [maximum, false];
      }

      const index = this.nextInitializedTick(ticks, tick, lte).index;
      const nextInitializedTick = Math.min(maximum, index);
      return [nextInitializedTick, nextInitializedTick === index];
    }
  }

  private static binarySearch(ticks: readonly Tick[], tick: number): number {
    invariant(
      !this.isBelowSmallest(ticks, tick),
      'TickList:  is below smallest'
    );

    let l = 0;
    let r = ticks.length - 1;
    let i;
    while (true) {
      i = Math.floor((l + r) / 2);

      if (
        ticks[i]!.index <= tick &&
        (i === ticks.length - 1 || ticks[i + 1]!.index > tick)
      ) {
        return i;
      }

      if (ticks[i]!.index < tick) {
        l = i + 1;
      } else {
        r = i - 1;
      }
    }
  }
}
