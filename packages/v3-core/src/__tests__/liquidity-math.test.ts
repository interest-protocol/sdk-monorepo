import { LiquidityMath } from '../lib';
import BigNumber from '../lib/big-number';

describe(LiquidityMath.name, () => {
  it('end to end', () => {
    expect(LiquidityMath.addDelta(1, 0).toString()).toBe(
      new BigNumber(1).toString()
    );
    expect(LiquidityMath.addDelta(1, -1).toString()).toBe(
      new BigNumber(0).toString()
    );
    expect(LiquidityMath.addDelta(1, 1).toString()).toBe(
      new BigNumber(2).toString()
    );
  });
});
