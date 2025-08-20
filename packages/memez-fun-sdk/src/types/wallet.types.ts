import { ObjectInput, MaybeTx } from '@interest-protocol/sui-core-sdk';

export interface WalletReceiveArgs extends MaybeTx {
  type: string;
  objectId: string;
  wallet: string;
}

interface Object {
  version: string;
  digest: string;
  objectId: string;
}

export interface WalletReceiveCoinsArgs extends MaybeTx {
  coinType: string;
  coins: Object[];
  wallet: string;
}

export interface WalletMergeCoinsArgs extends MaybeTx {
  coinType: string;
  coins: Object[];
  wallet: string;
}
