import { bcs } from '@mysten/sui/bcs';
import { blake2b } from '@noble/hashes/blake2.js';
import { normalizeSuiAddress, normalizeSuiObjectId } from '@mysten/sui/utils';

export interface ExtDataHashArgs {
  vortex: string; // Sui address
  recipient: string; // Sui address
  value: bigint;
  valueSign: boolean;
  relayer: string; // Sui address
  relayerFee: bigint;
  encryptedOutput1: bigint;
  encryptedOutput2: bigint;
}

export function computeExtDataHash(args: ExtDataHashArgs): Uint8Array {
  const {
    vortex,
    recipient,
    value,
    valueSign,
    relayer,
    relayerFee,
    encryptedOutput1,
    encryptedOutput2,
  } = args;

  // Serialize each field using BCS encoding (matching Move's to_bytes())
  const vortexBytes = bcs.Address.serialize(
    normalizeSuiObjectId(vortex)
  ).toBytes();
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
    .u256()
    .serialize(encryptedOutput1)
    .toBytes();
  const encryptedOutput2Bytes = bcs
    .u256()
    .serialize(encryptedOutput2)
    .toBytes();

  // Concatenate all bytes in the same order as Move
  const totalLength =
    vortexBytes.length +
    recipientBytes.length +
    valueBytes.length +
    valueSignBytes.length +
    relayerBytes.length +
    relayerFeeBytes.length +
    encryptedOutput1Bytes.length +
    encryptedOutput2Bytes.length;

  const data = new Uint8Array(totalLength);
  let offset = 0;

  data.set(vortexBytes, offset);
  offset += vortexBytes.length;

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
