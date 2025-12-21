import { normalizeSuiAddress, normalizeStructTag } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';
import { MerkleTree } from 'fixed-merkle-tree';
import { Utxo } from '../entities/utxo';
import { VortexKeypair } from '../entities/keypair';
import { ZERO_VALUE, MERKLE_TREE_HEIGHT } from '../constants';
import { poseidon2 } from '../crypto';
import { SuiObjectData } from '@mysten/sui/client';
import { pathOr } from 'ramda';
import { poseidon1 } from '../crypto';
import { BN254_FIELD_MODULUS } from '../constants';

export type MerklePath = [string, string][];

export function getMerklePath(
  merkleTree: MerkleTree,
  utxo: Utxo | null
): MerklePath {
  // Handle zero-amount UTXOs
  if (!utxo || utxo.amount === 0n) {
    return Array(MERKLE_TREE_HEIGHT)
      .fill(null)
      .map(() => [ZERO_VALUE.toString(), ZERO_VALUE.toString()]);
  }

  const utxoIndex = Number(utxo.index);
  const treeSize = merkleTree.elements.length;

  // For deposits, input UTXOs don't exist yet
  if (utxoIndex < 0 || utxoIndex >= treeSize) {
    return Array(MERKLE_TREE_HEIGHT)
      .fill(null)
      .map(() => [ZERO_VALUE.toString(), ZERO_VALUE.toString()]);
  }

  // Get Merkle path
  const { pathElements, pathIndices } = merkleTree.path(utxoIndex);
  const commitment = utxo.commitment();

  // Verify commitment matches what's in the tree
  const storedCommitment = BigInt(merkleTree.elements[utxoIndex]!);

  invariant(
    storedCommitment === commitment,
    `Commitment mismatch at index ${utxoIndex}: expected ${commitment}, got ${storedCommitment}`
  );

  // Build WASM-compatible path (always [left, right] format)
  const wasmPath: [string, string][] = [];
  let currentHash = commitment;

  for (let i = 0; i < MERKLE_TREE_HEIGHT; i++) {
    const sibling = BigInt(pathElements[i]!);
    const isLeft = pathIndices[i] === 0;

    invariant(sibling !== undefined, `Sibling undefined at level ${i}`);

    const leftHash = isLeft ? currentHash : sibling;
    const rightHash = isLeft ? sibling : currentHash;

    // Verify current hash appears in the pair (critical Rust check)
    if (currentHash !== leftHash && currentHash !== rightHash) {
      throw new Error(
        `Invalid path at level ${i}: current hash must be either left or right`
      );
    }

    wasmPath.push([leftHash.toString(), rightHash.toString()]);

    const nextHash = poseidon2(leftHash, rightHash);

    currentHash = nextHash;
  }

  const calculatedRoot = currentHash;
  const expectedRoot = BigInt(merkleTree.root);

  invariant(
    calculatedRoot === expectedRoot,
    `Root mismatch: calculated ${calculatedRoot}, expected ${expectedRoot}`
  );

  return wasmPath;
}

interface ToProveInputArgs {
  vortexObjectId: string;
  root: bigint;
  merklePath0: MerklePath;
  merklePath1: MerklePath;
  publicAmount: bigint;
  nullifier0: bigint;
  nullifier1: bigint;
  commitment0: bigint;
  commitment1: bigint;
  vortexKeypair: VortexKeypair;
  inputUtxo0: Utxo;
  inputUtxo1: Utxo;
  outputUtxo0: Utxo;
  outputUtxo1: Utxo;
  accountSecret: bigint;
}

export const toProveInput = ({
  root,
  merklePath0,
  merklePath1,
  publicAmount,
  nullifier0,
  nullifier1,
  commitment0,
  commitment1,
  vortexKeypair,
  inputUtxo0,
  inputUtxo1,
  outputUtxo0,
  outputUtxo1,
  vortexObjectId,
  accountSecret,
}: ToProveInputArgs) => {
  return {
    vortex:
      BigInt(
        normalizeSuiAddress(vortexObjectId, !vortexObjectId.startsWith('0x'))
      ) % BN254_FIELD_MODULUS,
    root,
    publicAmount,
    inputNullifier0: nullifier0,
    inputNullifier1: nullifier1,
    outputCommitment0: commitment0,
    outputCommitment1: commitment1,
    hashedAccountSecret: accountSecret === 0n ? 0n : poseidon1(accountSecret),

    accountSecret: accountSecret === 0n ? 12345n : accountSecret,
    inPrivateKey0: vortexKeypair.privateKey,
    inPrivateKey1: vortexKeypair.privateKey,
    inAmount0: inputUtxo0.amount,
    inAmount1: inputUtxo1.amount,
    inBlinding0: inputUtxo0.blinding,
    inBlinding1: inputUtxo1.blinding,
    inPathIndex0: inputUtxo0.index,
    inPathIndex1: inputUtxo1.index,
    merklePath0,
    merklePath1,

    outPublicKey0: vortexKeypair.publicKey,
    outPublicKey1: vortexKeypair.publicKey,
    outAmount0: outputUtxo0.amount,
    outAmount1: outputUtxo1.amount,
    outBlinding0: outputUtxo0.blinding,
    outBlinding1: outputUtxo1.blinding,
  };
};

const extractCoinType = (typeString: string) => {
  const match = typeString.match(/<(.+)>/)?.[1];
  invariant(match, 'Coin type not found');
  return match;
};

export const parseVortexPool = (data: SuiObjectData) => {
  invariant(
    data.content?.dataType === 'moveObject',
    'Vortex pool content type not found'
  );
  invariant(data.content?.type, 'Vortex pool content not found');

  return {
    objectId: data.objectId,
    version: data.version,
    digest: data.digest,
    type: data.content.type,
    balance: BigInt(pathOr(0, ['fields', 'balance'], data.content)),
    coinType: normalizeStructTag(extractCoinType(data.content.type)),
  };
};

export * from './events';
export * from './prove';
export * from './decrypt';
export * from './validate';
