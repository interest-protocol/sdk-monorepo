// packages/vortex/src/entities/merkle-tree.ts

import { ZERO_VALUE, MERKLE_TREE_HEIGHT } from '../constants';
import { poseidon2 } from '../crypto';
import { Element, MerkleTree as FixedMerkleTree } from 'fixed-merkle-tree';

export const buildMerkleTree = (elements: Element[] = []) =>
  new FixedMerkleTree(MERKLE_TREE_HEIGHT, elements, {
    hashFunction: (left: Element, right: Element) =>
      poseidon2(BigInt(left), BigInt(right)).toString(),
    zeroElement: ZERO_VALUE.toString(),
  });

export type MerkleTree = FixedMerkleTree;
