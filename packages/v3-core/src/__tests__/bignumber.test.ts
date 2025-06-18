import { BigNumberUtils } from '../lib';

describe('Convert functions from i256, i128, i64, i32 to BigNumber', () => {
  it('properly parses i256 numbers', () => {
    expect(BigNumberUtils.fromI256('0').toNumber()).toBe(0);
    expect(BigNumberUtils.fromI256('1').toNumber()).toBe(1);
    expect(
      BigNumberUtils.fromI256(
        '115792089237316195423570985008687907853269984665640564039457584007913129639929'
      ).toNumber()
    ).toBe(-7);
    expect(BigNumberUtils.fromI256('7').toNumber()).toBe(7);
  });

  it('properly parses i128 numbers', () => {
    expect(BigNumberUtils.fromI128('0').toNumber()).toBe(0);
    expect(BigNumberUtils.fromI128('1').toNumber()).toBe(1);
    expect(
      BigNumberUtils.fromI128(
        '340282366920938463463374607431768211449'
      ).toNumber()
    ).toBe(-7);
    expect(BigNumberUtils.fromI128('7').toNumber()).toBe(7);
  });

  it('properly parses i64 numbers', () => {
    expect(BigNumberUtils.fromI64('0').toNumber()).toBe(0);
    expect(BigNumberUtils.fromI64('1').toNumber()).toBe(1);
    expect(BigNumberUtils.fromI64('18446744073709551609').toNumber()).toBe(-7);
    expect(BigNumberUtils.fromI64('7').toNumber()).toBe(7);
  });

  it('properly parses i32 numbers', () => {
    expect(BigNumberUtils.fromI32('0').toNumber()).toBe(0);
    expect(BigNumberUtils.fromI32('1').toNumber()).toBe(1);
    expect(BigNumberUtils.fromI32('4294967289').toNumber()).toBe(-7);
    expect(BigNumberUtils.fromI32('7').toNumber()).toBe(7);
  });
});
