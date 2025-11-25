import { MaybeTx } from '@interest-protocol/sui-core-sdk';
import { TransactionResult } from '@mysten/sui/transactions';
import { Vortex } from './vortex';
import { VortexKeypair } from './entities/keypair';
import { MerkleTree } from './entities/merkle-tree';
import { Utxo } from './entities/utxo';

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

export interface TransactArgs extends MaybeTx {
  proof: TransactionResult;
  extData: TransactionResult;
  deposit: TransactionResult;
}

export interface DepositArgs extends MaybeTx {
  amount: bigint;
  vortex: Vortex;
  vortexKeypair: VortexKeypair;
  merkleTree: MerkleTree;
  unspentUtxos?: Utxo[];
}
