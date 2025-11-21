import { ZERO_VALUE, EMPTY_SUBTREE_HASHES } from '../constants';
import { poseidon2 } from '../crypto';

/**
 * @callback hashFunction
 * @param left Left leaf
 * @param right Right leaf
 */
/**
 * Merkle tree
 */
export class MerkleTree {
  levels: number;
  capacity: number;
  zeroElement;

  #zeros: bigint[];
  layers: bigint[][];

  constructor(levels: number) {
    this.levels = levels;
    this.capacity = 2 ** levels;
    this.zeroElement = ZERO_VALUE;
    this.#zeros = [];
    this.layers = [];
    this.layers[0] = [];
    this.#zeros[0] = this.zeroElement;

    for (let i = 0; i < levels; i++) {
      this.#zeros[i] = EMPTY_SUBTREE_HASHES[i];
    }
    this.#rebuild();
  }

  #rebuild() {
    for (let level = 1; level <= this.levels; level++) {
      this.layers[level] = [];
      for (let i = 0; i < Math.ceil(this.layers[level - 1].length / 2); i++) {
        this.layers[level][i] = poseidon2(
          this.layers[level - 1][i * 2],
          i * 2 + 1 < this.layers[level - 1].length
            ? this.layers[level - 1][i * 2 + 1]
            : this.#zeros[level - 1]
        );
      }
    }
  }

  root() {
    return this.layers[this.levels].length > 0
      ? this.layers[this.levels][0]
      : this.#zeros[this.levels];
  }

  bulkInsert(elements: bigint[]) {
    if (this.layers[0].length + elements.length > this.capacity) {
      throw new Error('Tree is full');
    }
    this.layers[0].push(...elements);
    this.#rebuild();
  }

  path(index: number) {
    if (isNaN(Number(index)) || index < 0 || index >= this.layers[0].length) {
      throw new Error('Index out of bounds: ' + index);
    }
    const pathElements: bigint[] = [];
    const pathIndices: number[] = [];
    for (let level = 0; level < this.levels; level++) {
      pathIndices[level] = index % 2;
      pathElements[level] = BigInt(
        (index ^ 1) < this.layers[level].length
          ? this.layers[level][index ^ 1]
          : this.#zeros[level]
      );
      index >>= 1;
    }
    return {
      pathElements,
      pathIndices,
    };
  }

  indexOf(element: bigint, comparator: Function | null = null) {
    if (comparator) {
      return this.layers[0].findIndex((el: bigint) => comparator(element, el));
    } else {
      return this.layers[0].indexOf(element);
    }
  }

  elements() {
    return this.layers[0].slice();
  }

  serialize() {
    return {
      levels: this.levels,
      zeros: this.#zeros,
      layers: this.layers,
    };
  }
}
