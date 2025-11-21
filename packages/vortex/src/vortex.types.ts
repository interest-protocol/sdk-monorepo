import { MaybeTx } from '@interest-protocol/sui-core-sdk';

export enum Action {
  Deposit,
  Withdraw,
}

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

export interface Proof {
  proofA: number[];
  proofB: number[];
  proofC: number[];
  publicInputs: [string, string, string, string, string, string, string];
  proofSerializedHex: string;
  publicInputsHex: string;
}

export interface NewExtDataArgs extends MaybeTx {
  recipient: string;
  value: bigint;
  relayer: string;
  relayerFee: bigint;
  encryptedOutput0: Uint8Array;
  encryptedOutput1: Uint8Array;
  action: Action;
}

export interface NewProofArgs extends MaybeTx {
  proofPoints: Uint8Array;
  root: bigint;
  publicValue: bigint;
  action: Action;
  extDataHash: bigint;
  inputNullifier0: bigint;
  inputNullifier1: bigint;
  outputCommitment0: bigint;
  outputCommitment1: bigint;
}
