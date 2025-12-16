// packages/vortex/src/entities/merkle-tree.ts

import { ZERO_VALUE, MERKLE_TREE_HEIGHT } from '../constants';
import { poseidon2 } from '../crypto';
import {
  Element,
  MerkleTree as FixedMerkleTree,
  SerializedTreeState,
} from 'fixed-merkle-tree';

export const merkleTreeHashFunction = (left: Element, right: Element) =>
  poseidon2(BigInt(left), BigInt(right)).toString();

export const buildMerkleTree = (elements: Element[] = []) =>
  new FixedMerkleTree(MERKLE_TREE_HEIGHT, elements, {
    hashFunction: merkleTreeHashFunction,
    zeroElement: ZERO_VALUE.toString(),
  });

export const deserializeMerkleTree = (data: SerializedTreeState) =>
  FixedMerkleTree.deserialize(data, merkleTreeHashFunction);

export type MerkleTree = FixedMerkleTree;
