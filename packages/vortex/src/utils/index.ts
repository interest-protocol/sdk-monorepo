import { toHex } from '@mysten/sui/utils';

export const reverseBytes = (bytes: Uint8Array): Uint8Array => {
  const reversed = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    reversed[i] = bytes[bytes.length - 1 - i]!;
  }
  return reversed;
};

export const bytesToBigInt = (bytes: Uint8Array): bigint => {
  return BigInt('0x' + toHex(reverseBytes(bytes)));
};

export * from './ext-data';
export * from './events';
