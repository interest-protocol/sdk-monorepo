import {
  VortexKeypair,
  Utxo,
  Vortex,
  MerkleTree,
  MERKLE_TREE_HEIGHT,
  ZERO_VALUE,
  poseidon2,
} from '@interest-protocol/vortex-sdk';

import {
  executeTx,
  keypair,
  devnetSuiClient,
  devInspectTransactionBlock,
} from '@interest-protocol/sui-utils';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { PROVING_KEY } from './proving-key';
import invariant from 'tiny-invariant';

export const VORTEX_PACKAGE_ID =
  '0x797c21c787bb7c99a2b76394515e95aabd3afb5950577ada8f7ff266c28a6b08';

export const VORTEX_POOL_OBJECT_ID =
  '0xc8121e16de5a2f671b70ea0172efbca3040059b24591421d27fc57369f1c6fad';

export const REGISTRY_OBJECT_ID =
  '0x6680bfb1a2cf02d41f2af22aa58bc52360123bd8f9576b7391f718162de0a435';

export const INITIAL_SHARED_VERSION = '17';

const relayerKeypair = Ed25519Keypair.fromSecretKey(process.env.RELAYER_KEY!);
const recipientKeypair = Ed25519Keypair.fromSecretKey(
  process.env.RECIPIENT_KEY!
);

export interface Env {
  VortexKeypair: typeof VortexKeypair;
  relayerKeypair: Ed25519Keypair;
  recipientKeypair: Ed25519Keypair;
  Utxo: typeof Utxo;
  suiClient: SuiClient;
  executeTx: (tx: Transaction, client?: SuiClient) => Promise<void>;
  keypair: Ed25519Keypair;
  POW_10_9: bigint;
  devInspectTransactionBlock: (
    tx: Transaction,
    sender: string,
    client?: SuiClient
  ) => Promise<any>;
  vortex: Vortex;
  verifyingKey: string;
  provingKey: string;
  getMerklePath: (
    merkleTree: MerkleTree,
    utxo: Utxo | null
  ) => [string, string][];
}

function getMerklePath(
  merkleTree: MerkleTree,
  utxo: Utxo | null
): [string, string][] {
  console.log('\n=== GET_MERKLE_PATH DEBUG ===');

  // Handle zero-amount UTXOs
  if (!utxo || utxo.amount === 0n) {
    console.log('Zero-amount UTXO, returning zero path');
    return Array(MERKLE_TREE_HEIGHT)
      .fill(null)
      .map(() => [ZERO_VALUE.toString(), ZERO_VALUE.toString()]);
  }

  const utxoIndex = Number(utxo.index);
  const treeSize = merkleTree.elements().length;

  console.log('UTXO Index:', utxoIndex);
  console.log('Tree size:', treeSize);
  console.log('UTXO amount:', utxo.amount.toString());

  // For deposits, input UTXOs don't exist yet
  if (utxoIndex < 0 || utxoIndex >= treeSize) {
    console.log('Index out of bounds, returning zero path');
    return Array(MERKLE_TREE_HEIGHT)
      .fill(null)
      .map(() => [ZERO_VALUE.toString(), ZERO_VALUE.toString()]);
  }

  // Get Merkle path
  const { pathElements, pathIndices } = merkleTree.path(utxoIndex);
  const commitment = utxo.commitment();

  console.log('Commitment (calculated):', commitment.toString());

  // Verify commitment matches what's in the tree
  const storedCommitment = merkleTree.elements()[utxoIndex]!;
  console.log('Commitment (stored):    ', storedCommitment.toString());
  console.log('Commitments match:', storedCommitment === commitment);

  invariant(
    storedCommitment === commitment,
    `Commitment mismatch at index ${utxoIndex}: expected ${commitment}, got ${storedCommitment}`
  );

  // Build WASM-compatible path (always [left, right] format)
  const wasmPath: [string, string][] = [];
  let currentHash = commitment;

  console.log('\n--- Path Construction ---');
  console.log(
    'Starting with commitment:',
    currentHash.toString().slice(0, 20) + '...'
  );

  for (let i = 0; i < MERKLE_TREE_HEIGHT; i++) {
    const sibling = pathElements[i];
    const isLeft = pathIndices[i] === 0;

    invariant(sibling !== undefined, `Sibling undefined at level ${i}`);

    const leftHash = isLeft ? currentHash : sibling;
    const rightHash = isLeft ? sibling : currentHash;

    console.log(`Level ${i}:`);
    console.log(`  isLeft: ${isLeft}`);
    console.log(`  current: ${currentHash.toString().slice(0, 20)}...`);
    console.log(`  sibling: ${sibling.toString().slice(0, 20)}...`);
    console.log(`  left:    ${leftHash.toString().slice(0, 20)}...`);
    console.log(`  right:   ${rightHash.toString().slice(0, 20)}...`);

    // Verify current hash appears in the pair (critical Rust check)
    if (currentHash !== leftHash && currentHash !== rightHash) {
      console.error(
        `ERROR at level ${i}: current hash not in [left, right] pair!`
      );
      throw new Error(
        `Invalid path at level ${i}: current hash must be either left or right`
      );
    }

    wasmPath.push([leftHash.toString(), rightHash.toString()]);

    const nextHash = poseidon2(leftHash, rightHash);
    console.log(`  hash(left, right): ${nextHash.toString().slice(0, 20)}...`);

    currentHash = nextHash;
  }

  const calculatedRoot = currentHash;
  const expectedRoot = merkleTree.root();

  console.log('\n--- Root Verification ---');
  console.log('Calculated root:', calculatedRoot.toString());
  console.log('Expected root:  ', expectedRoot.toString());
  console.log('Roots match:', calculatedRoot === expectedRoot);

  invariant(
    calculatedRoot === expectedRoot,
    `Root mismatch: calculated ${calculatedRoot}, expected ${expectedRoot}`
  );

  console.log('\n=== PATH CONSTRUCTION SUCCESS ===');
  console.log('WASM Path (first 3 levels):');
  for (let i = 0; i < Math.min(3, wasmPath.length); i++) {
    console.log(
      `  Level ${i}: [${wasmPath[i]![0].slice(0, 15)}..., ${wasmPath[i]![1].slice(0, 15)}...]`
    );
  }
  console.log('=================================\n');

  return wasmPath;
}

export const getEnv = async (): Promise<Env> => {
  return {
    VortexKeypair,
    relayerKeypair,
    recipientKeypair,
    suiClient: devnetSuiClient,
    Utxo,
    executeTx,
    keypair,
    POW_10_9: 10n ** 9n,
    devInspectTransactionBlock,
    vortex: new Vortex({
      packageId: VORTEX_PACKAGE_ID,
      registry: {
        objectId: REGISTRY_OBJECT_ID,
        initialSharedVersion: INITIAL_SHARED_VERSION,
      },
      vortex: {
        objectId: VORTEX_POOL_OBJECT_ID,
        initialSharedVersion: INITIAL_SHARED_VERSION,
      },
    }),
    verifyingKey:
      '8abc1628853c25306d08b697c715ffab55a9ee43e8fb72cc4a3b6bb74407830c63dc8914a6aa2ef6be195b0b1589ac1ad05ad5ac0ce6e34829f7cb9610340519cbab341c90c5acd97085ba44f27ffa35cf527faa2da9da29019090555ad895895445aab414e17fab2cae2ccb341b42181b3aca24f715ff4501f517d97d14f70161dfe981a5101f528c5b1abd54dd0c7eee2a99bac158aebf21742fa868c8b087c11fa867ffc856e7e60bd4b91dd3a4180ad2d4b74f2a5de084e778542392081811d75339fd7440a23509d461b63a90e6bb7f2e593e847370e963c196d242e72508000000000000001d19ff5f73fa37f2b0b680b77a68f3e86d2d77ea9b8626d32f8f9edbd5e1eb8311da60ebfddb6af168326b9ad4530decc1334d0d69e266bca56534de60f3f60e8d0707e07f236ad397d07f764297aa1349483f0df3b839d91e136c4eac31d98b8647740a025d296c6e18233e6a2799885db8636d12d5e511db98b1ac4a75ca15c315ded2f66c999f9f1fd6946428cfa5721fd373e240a87dd3873199ce41d1974acf6df1a1e17b03e6cc48408190f78138e6fc47f75041f4b8854a0b7d266e83776e8200ba8ad2dd35426b2a3871c49809252056fd9f14a4cef60647565825151d828cd7ba054f7c270748b0df2313fa6a9c978ed6c7015cadad17c91617d598'.trim(),
    provingKey: PROVING_KEY,
    getMerklePath,
  };
};
