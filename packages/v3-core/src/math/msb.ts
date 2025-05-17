export function mostSignificantBit(x: bigint): number {
  // Convert to binary string and find the length
  const bitLength = x.toString(2).length;

  // The most significant bit position is one less than the bit length
  return bitLength - 1;
}
