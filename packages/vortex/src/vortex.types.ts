import { MaybeTx } from '@interest-protocol/sui-core-sdk';

export interface RegisterArgs extends MaybeTx {
  encryptionKey: string;
}

export interface SharedObjectData {
  objectId: string;
  initialSharedVersion: string;
}

export interface ConstructorArgs {
  registry: SharedObjectData;
  vortex: SharedObjectData;
  fullNodeUrl?: string;
  packageId: string;
}

export interface ExtDataHashArgs {
  recipient: string; // Sui address
  value: bigint;
  valueSign: boolean;
  relayer: string; // Sui address
  relayerFee: bigint;
  encryptedOutput1: bigint;
  encryptedOutput2: bigint;
}

export interface NewExtDataArgs extends MaybeTx, ExtDataHashArgs {}
