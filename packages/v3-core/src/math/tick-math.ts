import invariant from 'tiny-invariant';

import { MaxUint256, One, Q32 } from '@/constants';
import { BigNumber, BigNumberUtils } from '@/lib';

import { Numberish } from '../types';
import { mostSignificantBit } from './msb';

function mulShift(val: BigNumber, mulBy: Numberish): BigNumber {
  return BigNumberUtils.shiftRight(val.multipliedBy(new BigNumber(mulBy)), 128);
}

export abstract class TickMath {
  private constructor() {}

  public static MIN_TICK: number = -443636;

  public static MAX_TICK: number = -TickMath.MIN_TICK;

  public static MIN_SQRT_RATIO: BigNumber = new BigNumber('4295048016');

  public static MAX_SQRT_RATIO: BigNumber = new BigNumber(
    '79226673515401279992447579061'
  );

  public static getSqrtRatioAtTick(tick: number): BigNumber {
    invariant(
      tick >= TickMath.MIN_TICK &&
        tick <= TickMath.MAX_TICK &&
        Number.isInteger(tick),
      'TICK'
    );
    const absTick: number = tick < 0 ? Math.abs(tick) : tick;

    let ratio: BigNumber =
      (absTick & 0x1) !== 0
        ? new BigNumber('0xfffcb933bd6fad37aa2d162d1a594001')
        : new BigNumber('0x100000000000000000000000000000000');
    if ((absTick & 0x2) !== 0)
      ratio = mulShift(ratio, '0xfff97272373d413259a46990580e213a');
    if ((absTick & 0x4) !== 0)
      ratio = mulShift(ratio, '0xfff2e50f5f656932ef12357cf3c7fdcc');
    if ((absTick & 0x8) !== 0)
      ratio = mulShift(ratio, '0xffe5caca7e10e4e61c3624eaa0941cd0');
    if ((absTick & 0x10) !== 0)
      ratio = mulShift(ratio, '0xffcb9843d60f6159c9db58835c926644');
    if ((absTick & 0x20) !== 0)
      ratio = mulShift(ratio, '0xff973b41fa98c081472e6896dfb254c0');
    if ((absTick & 0x40) !== 0)
      ratio = mulShift(ratio, '0xff2ea16466c96a3843ec78b326b52861');
    if ((absTick & 0x80) !== 0)
      ratio = mulShift(ratio, '0xfe5dee046a99a2a811c461f1969c3053');
    if ((absTick & 0x100) !== 0)
      ratio = mulShift(ratio, '0xfcbe86c7900a88aedcffc83b479aa3a4');
    if ((absTick & 0x200) !== 0)
      ratio = mulShift(ratio, '0xf987a7253ac413176f2b074cf7815e54');
    if ((absTick & 0x400) !== 0)
      ratio = mulShift(ratio, '0xf3392b0822b70005940c7a398e4b70f3');
    if ((absTick & 0x800) !== 0)
      ratio = mulShift(ratio, '0xe7159475a2c29b7443b29c7fa6e889d9');
    if ((absTick & 0x1000) !== 0)
      ratio = mulShift(ratio, '0xd097f3bdfd2022b8845ad8f792aa5825');
    if ((absTick & 0x2000) !== 0)
      ratio = mulShift(ratio, '0xa9f746462d870fdf8a65dc1f90e061e5');
    if ((absTick & 0x4000) !== 0)
      ratio = mulShift(ratio, '0x70d869a156d2a1b890bb3df62baf32f7');
    if ((absTick & 0x8000) !== 0)
      ratio = mulShift(ratio, '0x31be135f97d08fd981231505542fcfa6');
    if ((absTick & 0x10000) !== 0)
      ratio = mulShift(ratio, '0x9aa508b5b7a84e1c677de54f3e99bc9');
    if ((absTick & 0x20000) !== 0)
      ratio = mulShift(ratio, '0x5d6af8dedb81196699c329225ee604');
    if ((absTick & 0x40000) !== 0)
      ratio = mulShift(ratio, '0x2216e584f5fa1ea926041bedfe98');
    if ((absTick & 0x80000) !== 0)
      ratio = mulShift(ratio, '0x48a170391f7dc42444e8fa2');

    if (tick > 0) ratio = MaxUint256.div(ratio);

    const p = ratio.mod(Q32).isZero()
      ? ratio.div(Q32)
      : ratio.div(Q32).plus(One);

    return p.div(Q32);
  }

  public static getTickAtSqrtRatio(sqrtRatioX64: BigNumber): number {
    invariant(
      sqrtRatioX64.gte(TickMath.MIN_SQRT_RATIO) &&
        sqrtRatioX64.lt(TickMath.MAX_SQRT_RATIO),
      'sqrtRatioX64 is out of bounds'
    );

    const sqrtRatioX128 = BigNumberUtils.shiftLeft(sqrtRatioX64, 64);

    const msb = mostSignificantBit(sqrtRatioX128);

    let r: BigNumber;
    if (msb >= 128) {
      r = BigNumberUtils.shiftRight(sqrtRatioX128, msb - 127);
    } else {
      r = BigNumberUtils.shiftLeft(sqrtRatioX128, 127 - msb);
    }

    let log_2: BigNumber = BigNumberUtils.shiftLeft(BigNumber(msb - 128), 64);

    for (let i = 0; i < 14; i++) {
      r = BigNumberUtils.shiftRight(r.multipliedBy(r), 127);
      const f = BigNumberUtils.shiftRight(r, 128);
      log_2 = BigNumberUtils.bitwiseOr(
        log_2,
        BigNumberUtils.shiftLeft(f, 63 - i)
      );
      r = BigNumberUtils.shiftRight(r, f.toNumber());
    }

    const log_sqrt10001 = log_2.multipliedBy(
      new BigNumber('255738958999603826347141')
    );

    const tickLow = BigNumberUtils.shiftRight(
      log_sqrt10001.minus(
        new BigNumber('3402992956809132418596140100660247210')
      ),
      128
    );
    const tickHigh = BigNumberUtils.shiftRight(
      log_sqrt10001.plus(
        new BigNumber('291339464771989622907027621153398088495')
      ),
      128
    );

    return tickLow.eq(tickHigh)
      ? tickLow.toNumber()
      : TickMath.getSqrtRatioAtTick(tickHigh.toNumber()).lte(sqrtRatioX64)
        ? tickHigh.toNumber()
        : tickLow.toNumber();
  }
}
