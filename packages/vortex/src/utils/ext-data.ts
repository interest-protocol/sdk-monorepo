import { bcs } from '@mysten/sui/bcs';
import { blake2b } from '@noble/hashes/blake2.js';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { toHex } from '@mysten/sui/utils';

import { ExtDataHashArgs } from '../vortex.types';

export function computeExtDataHash({
  recipient,
  value,
  valueSign,
  relayer,
  relayerFee,
  encryptedOutput1,
  encryptedOutput2,
}: ExtDataHashArgs): Uint8Array {
  // Serialize each field using BCS encoding (matching Move's to_bytes())

  const recipientBytes = bcs.Address.serialize(
    normalizeSuiAddress(recipient)
  ).toBytes();
  const valueBytes = bcs.u64().serialize(value).toBytes();
  const valueSignBytes = bcs.bool().serialize(valueSign).toBytes();
  const relayerBytes = bcs.Address.serialize(
    normalizeSuiAddress(relayer)
  ).toBytes();
  const relayerFeeBytes = bcs.u64().serialize(relayerFee).toBytes();
  const encryptedOutput1Bytes = bcs
    .vector(bcs.u8())
    .serialize(encryptedOutput1)
    .toBytes();
  const encryptedOutput2Bytes = bcs
    .vector(bcs.u8())
    .serialize(encryptedOutput2)
    .toBytes();

  // Concatenate all bytes in the same order as Move
  const totalLength =
    recipientBytes.length +
    valueBytes.length +
    valueSignBytes.length +
    relayerBytes.length +
    relayerFeeBytes.length +
    encryptedOutput1Bytes.length +
    encryptedOutput2Bytes.length;

  const data = new Uint8Array(totalLength);
  let offset = 0;

  data.set(recipientBytes, offset);
  offset += recipientBytes.length;

  data.set(valueBytes, offset);
  offset += valueBytes.length;

  data.set(valueSignBytes, offset);
  offset += valueSignBytes.length;

  data.set(relayerBytes, offset);
  offset += relayerBytes.length;

  data.set(relayerFeeBytes, offset);
  offset += relayerFeeBytes.length;

  data.set(encryptedOutput1Bytes, offset);
  offset += encryptedOutput1Bytes.length;

  data.set(encryptedOutput2Bytes, offset);
  offset += encryptedOutput2Bytes.length;

  // Hash with blake2b256 (matching Move's hash::blake2b256)
  return blake2b(data, { dkLen: 32 });
}
