import { LiquidityMath } from '../lib';

describe(LiquidityMath.name, () => {
  it('end to end', () => {
    expect(LiquidityMath.addDelta(1, 0)).toBe(1n);
    expect(LiquidityMath.addDelta(1, -1)).toBe(0n);
    expect(LiquidityMath.addDelta(1, 1)).toBe(2n);
  });
});
