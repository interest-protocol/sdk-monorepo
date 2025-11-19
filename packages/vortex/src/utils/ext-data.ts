import { bcs } from '@mysten/sui/bcs';
import { blake2b } from '@noble/hashes/blake2.js';
import { normalizeSuiAddress } from '@mysten/sui/utils';

import { ExtDataHashArgs } from '../vortex.types';

export function computeExtDataHash({
  recipient,
  value,
  valueSign,
  relayer,
  relayerFee,
  encryptedOutput1,
  encryptedOutput0,
}: ExtDataHashArgs): Uint8Array {
  // Serialize each field using BCS encoding (matching Move's to_bytes())

  const extDataHashBytesArray = [
    bcs.Address.serialize(normalizeSuiAddress(recipient)).toBytes(),
    bcs.u64().serialize(value).toBytes(),
    bcs.bool().serialize(valueSign).toBytes(),
    bcs.Address.serialize(normalizeSuiAddress(relayer)).toBytes(),
    bcs.u64().serialize(relayerFee).toBytes(),
    bcs.vector(bcs.u8()).serialize(encryptedOutput0).toBytes(),
    bcs.vector(bcs.u8()).serialize(encryptedOutput1).toBytes(),
  ];

  const totalLength = extDataHashBytesArray.reduce(
    (acc, curr) => acc + curr.length,
    0
  );

  const extDataHashBytes = new Uint8Array(totalLength);
  let offset = 0;

  for (const byte of extDataHashBytesArray) {
    extDataHashBytes.set(byte, offset);
    offset += byte.length;
  }

  // Concatenate all bytes in the same order as Move
  return blake2b(extDataHashBytes, { dkLen: 32 });
}
