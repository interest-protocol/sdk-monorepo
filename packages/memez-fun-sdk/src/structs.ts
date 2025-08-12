import { bcs } from '@mysten/sui/bcs';
import { fromHex, toHex } from '@mysten/sui/utils';

export const FeePayload = bcs.struct('FeePayload', {
  value: bcs.u64(),
  percentages: bcs.vector(bcs.u64()),
  recipients: bcs.vector(bcs.Address),
});

export const MemezFees = bcs.struct('MemezFees', {
  creation: FeePayload,
  meme_swap: FeePayload,
  quote_swap: FeePayload,
  migration: FeePayload,
  allocation: FeePayload,
  vesting_periods: bcs.vector(bcs.u64()),
  dynamic_stake_holders: bcs.u64(),
});

// define UID as a 32-byte array, then add a transform to/from hex strings
const UID = bcs.fixedArray(32, bcs.u8()).transform({
  input: (id: string) => fromHex(id),
  output: (id) => toHex(Uint8Array.from(id)),
});

export const Coin = bcs.struct('Coin', {
  id: UID,
  value: bcs.u64(),
});
