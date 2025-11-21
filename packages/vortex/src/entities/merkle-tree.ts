// packages/vortex/src/entities/merkle-tree.ts

import { ZERO_VALUE, EMPTY_SUBTREE_HASHES } from '../constants';
import { poseidon2 } from '../crypto';

/**
 * Sparse Merkle tree using Tornado Cash Nova's paired insertion strategy.
 * Inserts two leaves at once for better efficiency and privacy.
 */
export class MerkleTree {
  levels: number;
  capacity: number;
  zeroElement: bigint;

  private zeros: bigint[];
  private subtrees: bigint[]; // filledSubtrees in Tornado Nova (indices 0..levels-1)
  private _nextIndex: number;
  private leaves: bigint[];
  private _root: bigint;

  constructor(levels: number) {
    this.levels = levels;
    this.capacity = 2 ** levels;
    this.zeroElement = ZERO_VALUE;
    this.zeros = [];
    this.subtrees = [];
    this._nextIndex = 0;
    this.leaves = [];

    // Initialize zero hashes (0 to levels, inclusive)
    // We need levels+1 elements: zeros[0] through zeros[levels]
    for (let i = 0; i <= levels; i++) {
      this.zeros[i] = EMPTY_SUBTREE_HASHES[i];
    }

    // Initialize subtrees[0..levels-1] (matching Nova's filledSubtrees)
    // subtrees[0] is initialized but never used (Nova quirk)
    for (let i = 0; i < levels; i++) {
      this.subtrees[i] = this.zeros[i];
    }

    // Empty root is zeros[levels]
    this._root = this.zeros[levels];
  }

  /**
   * Returns the current Merkle root
   */
  root(): bigint {
    return this._root;
  }

  /**
   * Insert elements in bulk (must be even number for pairing)
   */
  bulkInsert(elements: bigint[]) {
    if (elements.length % 2 !== 0) {
      throw new Error('Must insert even number of elements (pairs)');
    }

    for (let i = 0; i < elements.length; i += 2) {
      this.insertPair(elements[i], elements[i + 1]);
    }
  }

  /**
   * Insert a pair of leaves (Nova style)
   * This is the primary insertion method
   */
  insertPair(leaf1: bigint, leaf2: bigint) {
    if (this._nextIndex >= this.capacity) {
      throw new Error('Merkle tree is full. No more leaves can be added');
    }

    // Store both leaves
    this.leaves.push(leaf1, leaf2);

    // Start by hashing the pair (level 0)
    let currentIndex = Math.floor(this._nextIndex / 2);
    let currentLevelHash = poseidon2(leaf1, leaf2);

    // Increment by 2 since we're inserting a pair
    this._nextIndex += 2;

    // Process levels 1 to levels-1 (matching Nova: for i = 1; i < levels)
    for (let i = 1; i < this.levels; i++) {
      let left: bigint;
      let right: bigint;

      if (currentIndex % 2 === 0) {
        // Current is left child
        left = currentLevelHash;
        right = this.zeros[i];
        this.subtrees[i] = currentLevelHash; // Cache left subtree
      } else {
        // Current is right child
        left = this.subtrees[i]; // Get cached left subtree
        right = currentLevelHash;
      }

      currentLevelHash = poseidon2(left, right);
      currentIndex = Math.floor(currentIndex / 2);
    }

    // Update root
    this._root = currentLevelHash;
  }

  /**
   * Insert a single leaf (for backward compatibility)
   * Pairs it with a zero leaf
   */
  insert(leaf: bigint) {
    this.insertPair(leaf, this.zeros[0]);
  }

  /**
   * Generate Merkle path for a leaf at given index
   * Returns sibling hashes and indices for verification
   */
  path(index: number): { pathElements: bigint[]; pathIndices: number[] } {
    if (index < 0 || index >= this._nextIndex) {
      throw new Error(
        `Index out of bounds: ${index} (tree has ${this._nextIndex} leaves)`
      );
    }

    const pathElements: bigint[] = [];
    const pathIndices: number[] = [];

    // Level 0: Get sibling leaf
    const isLeftAtLevel0 = index % 2 === 0;
    pathIndices.push(isLeftAtLevel0 ? 0 : 1);

    const siblingIndex = isLeftAtLevel0 ? index + 1 : index - 1;
    const sibling =
      siblingIndex < this._nextIndex
        ? this.leaves[siblingIndex]
        : this.zeros[0];
    pathElements.push(sibling);

    // Levels 1 to levels-1 (matching Nova's loop structure)
    let currentIndex = Math.floor(index / 2);
    for (let i = 1; i < this.levels; i++) {
      const isLeft = currentIndex % 2 === 0;
      pathIndices.push(isLeft ? 0 : 1);

      if (isLeft) {
        // We're left child, sibling is right (zero hash)
        pathElements.push(this.zeros[i]);
      } else {
        // We're right child, sibling is the cached left subtree
        pathElements.push(this.subtrees[i]);
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return { pathElements, pathIndices };
  }

  /**
   * Get all leaves in the tree
   */
  elements(): bigint[] {
    return [...this.leaves];
  }

  /**
   * Find the index of a specific leaf
   */
  indexOf(element: bigint, comparator: Function | null = null): number {
    if (comparator) {
      return this.leaves.findIndex((leaf) => comparator(element, leaf));
    }
    return this.leaves.findIndex((leaf) => leaf === element);
  }

  /**
   * Serialize tree state
   */
  serialize() {
    return {
      levels: this.levels,
      zeros: this.zeros,
      subtrees: this.subtrees,
      nextIndex: this._nextIndex,
      leaves: this.leaves,
      root: this._root,
    };
  }

  /**
   * Backward compatibility property
   * Returns leaves as first layer
   */
  get layers(): bigint[][] {
    return [this.leaves];
  }

  /**
   * Verify a Merkle path is valid for a given leaf and root
   */
  verify(
    leaf: bigint,
    pathElements: bigint[],
    pathIndices: number[],
    root: bigint
  ): boolean {
    if (
      pathElements.length !== this.levels ||
      pathIndices.length !== this.levels
    ) {
      return false;
    }

    let currentHash = leaf;

    for (let i = 0; i < this.levels; i++) {
      const sibling = pathElements[i];
      const isLeft = pathIndices[i] === 0;

      if (isLeft) {
        currentHash = poseidon2(currentHash, sibling);
      } else {
        currentHash = poseidon2(sibling, currentHash);
      }
    }

    return currentHash === root;
  }

  /**
   * Get the current number of leaves in the tree
   */
  get nextIndex(): number {
    return this._nextIndex;
  }

  /**
   * Check if the tree is full
   */
  isFull(): boolean {
    return this._nextIndex >= this.capacity;
  }

  /**
   * Get the maximum capacity of the tree
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Get the current fill percentage
   */
  getFillPercentage(): number {
    return (this._nextIndex / this.capacity) * 100;
  }
}
