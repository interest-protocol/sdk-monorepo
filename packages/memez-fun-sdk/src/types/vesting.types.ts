import { ObjectInput, U64, MaybeTx } from '@interest-protocol/sui-core-sdk';

export interface NewArgs extends MaybeTx {
  coin: ObjectInput;
  start: U64;
  duration: U64;
  owner: string;
  coinType: string;
}

export interface Vesting {
  objectId: string;
  version: string;
  digest: string;
  balance: bigint;
  released: bigint;
  start: bigint;
  duration: bigint;
  owner: string;
  coinType: string;
}

export interface ClaimArgs extends MaybeTx {
  vesting: string | Vesting;
}

export interface DestroyZeroBalanceArgs extends MaybeTx {
  vesting: string | Vesting;
}

export interface UncheckedDestroyZeroBalanceArgs extends MaybeTx {
  vestingObjectId: string;
  coinType: string;
}
