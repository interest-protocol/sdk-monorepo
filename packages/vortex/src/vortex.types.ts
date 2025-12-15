import { MaybeTx } from '@interest-protocol/sui-core-sdk';
import { TransactionResult } from '@mysten/sui/transactions';
import { Vortex } from './vortex';
import { VortexKeypair } from './entities/keypair';
import { Utxo } from './entities/utxo';
import { CoinStruct } from '@mysten/sui/client';
import { MerklePath } from './utils';

export enum Action {
  Deposit,
  Withdraw,
}

interface NestedResult {
  $kind: 'NestedResult';
  NestedResult: [number, number];
}

export type GetMerklePathFn = (utxo: Utxo | null) => Promise<MerklePath>;

export interface RegisterArgs extends MaybeTx {
  encryptionKey: string;
}

export interface SharedObjectData {
  objectId: string;
  initialSharedVersion: string;
}

export interface ConstructorArgs {
  registry: SharedObjectData;
  fullNodeUrl?: string;
  packageId: string;
  swapPackageId: string;
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
  value: bigint;
  relayer: string;
  relayerFee: bigint;
  encryptedOutput0: Uint8Array;
  encryptedOutput1: Uint8Array;
  action: Action;
}

export interface NewProofArgs extends MaybeTx {
  vortexPool: string | VortexPool;
  proofPoints: Uint8Array;
  root: bigint;
  publicValue: bigint;
  action: Action;
  inputNullifier0: bigint;
  inputNullifier1: bigint;
  outputCommitment0: bigint;
  outputCommitment1: bigint;
}

interface NestedResult {
  $kind: 'NestedResult';
  NestedResult: [number, number];
}

export interface VortexPool {
  objectId: string;
  version: string;
  digest: string;
  type: string;
  balance: bigint;
  coinType: string;
}

export interface TransactArgs extends MaybeTx {
  vortexPool: string | VortexPool;
  proof: TransactionResult;
  extData: TransactionResult;
  deposit: TransactionResult | NestedResult;
}

export interface TransactWithAccountArgs extends MaybeTx {
  vortexPool: string | VortexPool;
  account: string;
  coins: Object[];
  proof: TransactionResult;
  extData: TransactionResult;
}

export interface NewArgs extends MaybeTx {
  coinType: string;
}

export interface DepositArgs extends MaybeTx {
  amount: bigint;
  vortexSdk: Vortex;
  vortexPool: string | VortexPool;
  vortexKeypair: VortexKeypair;
  root: bigint;
  getMerklePathFn: GetMerklePathFn;
  unspentUtxos?: Utxo[];
  relayer?: string;
  relayerFee?: bigint;
}

export interface DepositWithAccountArgs extends MaybeTx {
  vortexSdk: Vortex;
  vortexPool: string | VortexPool;
  vortexKeypair: VortexKeypair;
  root: bigint;
  getMerklePathFn: GetMerklePathFn;
  unspentUtxos?: Utxo[];
  account: string;
  accountSecret: bigint;
  coinStructs: CoinStruct[];
  relayer?: string;
  relayerFee?: bigint;
}

export interface WithdrawArgs extends MaybeTx {
  amount: bigint;
  vortexPool: string | VortexPool;
  unspentUtxos: Utxo[];
  vortexSdk: Vortex;
  vortexKeypair: VortexKeypair;
  root: bigint;
  getMerklePathFn: GetMerklePathFn;
  relayer: string;
  relayerFee: bigint;
}

export interface WithdrawWithAccountArgs extends MaybeTx {
  vortexSdk: Vortex;
  vortexPool: string | VortexPool;
  vortexKeypair: VortexKeypair;
  root: bigint;
  getMerklePathFn: GetMerklePathFn;
  unspentUtxos?: Utxo[];
  account: string;
  accountSecret: bigint;
  relayer: string;
  relayerFee: bigint;
  amount: bigint;
}

export interface ParsedCommitmentEvent {
  commitment: bigint;
  index: bigint;
  encryptedOutput: string;
  coinType: string;
}

export interface IsNullifierSpentArgs {
  nullifier: bigint;
  vortexPool: string | VortexPool;
}

export interface AreNullifiersSpentArgs {
  nullifiers: bigint[];
  vortexPool: string | VortexPool;
}

export interface NewAccountArgs extends MaybeTx {
  hashedSecret: bigint;
}

interface Object {
  version: string;
  digest: string;
  objectId: string;
}

export interface MergeCoinsArgs extends MaybeTx {
  account: string;
  coinType: string;
  coins: Object[];
}

export interface StartSwapArgs extends MaybeTx {
  vortex: string | VortexPool;
  proof: TransactionResult;
  extData: TransactionResult;
  relayer: string;
  minAmountOut: bigint;
  coinOutType: string;
}

export interface FinishSwapArgs extends MaybeTx {
  vortex: string | VortexPool;
  coinOut: TransactionResult;
  proof: TransactionResult;
  extData: TransactionResult;
  receipt: TransactionResult | NestedResult;
  coinInType: string;
}

export interface StartSwapHelperArgs extends MaybeTx {
  amount: bigint;
  vortexPool: string | VortexPool;
  unspentUtxos: Utxo[];
  vortexSdk: Vortex;
  vortexKeypair: VortexKeypair;
  root: bigint;
  getMerklePathFn: GetMerklePathFn;
  relayer: string;
  minAmountOut: bigint;
  coinOutType: string;
}

export interface FinishSwapHelperArgs extends MaybeTx {
  amount: bigint;
  vortexSdk: Vortex;
  vortexPool: string | VortexPool;
  vortexKeypair: VortexKeypair;
  root: bigint;
  getMerklePathFn: GetMerklePathFn;
  unspentUtxos?: Utxo[];
  coinOut: TransactionResult;
  receipt: TransactionResult | NestedResult;
  coinInType: string;
}
