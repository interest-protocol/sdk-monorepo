import { add } from './index';

describe('add function', () => {
  it('adds two positive numbers correctly', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('handles negative numbers', () => {
    expect(add(5, -3)).toBe(2);
    expect(add(-5, -3)).toBe(-8);
  });

  it('handles zero', () => {
    expect(add(0, 5)).toBe(5);
    expect(add(5, 0)).toBe(5);
  });
});
