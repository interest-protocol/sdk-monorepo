import { bcs, BcsType } from '@mysten/sui/bcs';
import { fromHex, toHex } from '@mysten/sui/utils';

export const VecMap = (K: BcsType<any, any>, V: BcsType<any, any>) =>
  bcs.struct(`VecMap<${K.name}, ${V.name}>`, {
    contents: bcs.vector(bcs.struct('Entry', { key: K, value: V })),
  });

export const ID = bcs.fixedArray(32, bcs.u8()).transform({
  input: (id: string) => fromHex(id),
  output: (id) => toHex(Uint8Array.from(id)),
});

export const OptionU64 = bcs.option(bcs.u64());
