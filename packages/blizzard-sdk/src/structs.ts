import { ID } from '@interest-protocol/sui-core-sdk';
import { bcs } from '@mysten/sui/bcs';

export const EpochValue = bcs.struct('EpochValue', {
  epoch: bcs.u32(),
  value: bcs.u64(),
});

export const IX = bcs.struct('IX', {
  node_id: ID,
  epoch_values: bcs.vector(EpochValue),
});
