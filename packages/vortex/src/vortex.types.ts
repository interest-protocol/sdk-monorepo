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
  encryptedOutput0: Uint8Array;
  encryptedOutput1: Uint8Array;
}

export interface NewExtDataArgs extends MaybeTx, ExtDataHashArgs {}

export interface Proof {
  proofA: number[];
  proofB: number[];
  proofC: number[];
  publicInputs: [string, string, string, string, string, string, string];
  proofSerializedHex: string;
  publicInputsHex: string;
}
