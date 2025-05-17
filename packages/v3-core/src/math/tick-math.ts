import { MaxUint256 } from '@/constants';

import { mostSignificantBit } from './msb';

const Q32 = 1n << 32n;

const MAX_UINT256 = BigInt(MaxUint256.toString());

export abstract class TickMath {
  private constructor() {}

  public static MIN_TICK: number = -443636;

  public static MAX_TICK: number = -TickMath.MIN_TICK;

  public static MIN_SQRT_RATIO = 4295048016n;

  public static MAX_SQRT_RATIO = 79226673515401279992447579061n;

  public static getSqrtRatioAtTick(tick: number): bigint {
    // Validate tick range
    if (
      tick < TickMath.MIN_TICK ||
      tick > TickMath.MAX_TICK ||
      !Number.isInteger(tick)
    ) {
      throw new Error('TICK');
    }

    const absTick: number = tick < 0 ? -tick : tick;

    // Start with ratio either at Q96 or the adjusted value for odd ticks
    let ratio: bigint =
      (absTick & 0x1) !== 0
        ? 0xfffcb933bd6fad37aa2d162d1a594001n
        : 0x100000000000000000000000000000000n;

    // Check each bit and apply the multiplication if set
    if ((absTick & 0x2) !== 0)
      ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n;
    if ((absTick & 0x4) !== 0)
      ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n;
    if ((absTick & 0x8) !== 0)
      ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
    if ((absTick & 0x10) !== 0)
      ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
    if ((absTick & 0x20) !== 0)
      ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
    if ((absTick & 0x40) !== 0)
      ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
    if ((absTick & 0x80) !== 0)
      ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
    if ((absTick & 0x100) !== 0)
      ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
    if ((absTick & 0x200) !== 0)
      ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
    if ((absTick & 0x400) !== 0)
      ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
    if ((absTick & 0x800) !== 0)
      ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
    if ((absTick & 0x1000) !== 0)
      ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
    if ((absTick & 0x2000) !== 0)
      ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
    if ((absTick & 0x4000) !== 0)
      ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
    if ((absTick & 0x8000) !== 0)
      ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
    if ((absTick & 0x10000) !== 0)
      ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
    if ((absTick & 0x20000) !== 0)
      ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n;
    if ((absTick & 0x40000) !== 0)
      ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n;
    if ((absTick & 0x80000) !== 0)
      ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n;

    // Invert the ratio if tick is positive
    if (tick > 0) {
      ratio = MAX_UINT256 / ratio;
    }

    // Check if ratio is divisible by Q32 without remainder
    const p = ratio % Q32 === 0n ? ratio / Q32 : ratio / Q32 + 1n;

    return p / Q32;
  }

  public static getTickAtSqrtRatio(sqrtRatioX64: bigint): number {
    // Validation
    if (
      sqrtRatioX64 < TickMath.MIN_SQRT_RATIO ||
      sqrtRatioX64 >= TickMath.MAX_SQRT_RATIO
    ) {
      throw new Error('sqrtRatioX64 is out of bounds');
    }

    // Left shift by 64 bits
    const sqrtRatioX128 = sqrtRatioX64 << 64n;

    // Find most significant bit
    const msb = mostSignificantBit(sqrtRatioX128);

    // Adjust the value based on the MSB
    let r: bigint;
    if (msb >= 128) {
      r = sqrtRatioX128 >> BigInt(msb - 127);
    } else {
      r = sqrtRatioX128 << BigInt(127 - msb);
    }

    // Calculate log_2
    let log_2: bigint = BigInt(msb - 128) << 64n;

    // Iterative approximation
    for (let i = 0; i < 14; i++) {
      r = (r * r) >> 127n;
      const f = r >> 128n;
      log_2 = log_2 | (f << BigInt(63 - i));
      r = r >> f;
    }

    // Constants for log calculation
    const LOG_MULTIPLIER = 255738958999603826347141n;
    const TICK_LOW_OFFSET = 3402992956809132418596140100660247210n;
    const TICK_HIGH_OFFSET = 291339464771989622907027621153398088495n;

    // Calculate log_sqrt10001
    const log_sqrt10001 = log_2 * LOG_MULTIPLIER;

    // Calculate tick boundaries
    const tickLow = (log_sqrt10001 - TICK_LOW_OFFSET) >> 128n;
    const tickHigh = (log_sqrt10001 + TICK_HIGH_OFFSET) >> 128n;

    // Determine the final tick
    if (tickLow === tickHigh) {
      return Number(tickLow);
    } else {
      // Check if we should use the high or low tick
      return TickMath.getSqrtRatioAtTick(Number(tickHigh)) <= sqrtRatioX64
        ? Number(tickHigh)
        : Number(tickLow);
    }
  }
}
