import { ZERO_VALUE } from '../constants';
import { poseidon2 } from 'poseidon-lite';

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

  constructor(
    levels: number,
    elements: bigint[] = [],
    { zeroElement = ZERO_VALUE } = {}
  ) {
    this.levels = levels;
    this.capacity = 2 ** levels;
    this.zeroElement = zeroElement;
    if (elements.length > this.capacity) {
      throw new Error('Tree is full');
    }
    this.#zeros = [];
    this.layers = [];
    this.layers[0] = elements;
    this.#zeros[0] = this.zeroElement;

    for (let i = 1; i <= levels; i++) {
      this.#zeros[i] = poseidon2([this.#zeros[i - 1], this.#zeros[i - 1]]);
    }
    this.#rebuild();
  }

  #rebuild() {
    for (let level = 1; level <= this.levels; level++) {
      this.layers[level] = [];
      for (let i = 0; i < Math.ceil(this.layers[level - 1].length / 2); i++) {
        this.layers[level][i] = poseidon2([
          this.layers[level - 1][i * 2],
          i * 2 + 1 < this.layers[level - 1].length
            ? this.layers[level - 1][i * 2 + 1]
            : this.#zeros[level - 1],
        ]);
      }
    }
  }

  root() {
    return this.layers[this.levels].length > 0
      ? this.layers[this.levels][0]
      : this.#zeros[this.levels];
  }

  insert(element: bigint) {
    if (this.layers[0].length >= this.capacity) {
      throw new Error('Tree is full');
    }
    this.update(this.layers[0].length, element);
  }

  bulkInsert(elements: bigint[]) {
    if (this.layers[0].length + elements.length > this.capacity) {
      throw new Error('Tree is full');
    }
    this.layers[0].push(...elements);
    this.#rebuild();
  }

  // TODO: update does not work debug

  update(index: number, element: bigint) {
    // index 0 and 1 and element is the commitment hash
    if (
      isNaN(Number(index)) ||
      index < 0 ||
      index > this.layers[0].length ||
      index >= this.capacity
    ) {
      throw new Error('Insert index out of bounds: ' + index);
    }
    this.layers[0][index] = element;
    for (let level = 1; level <= this.levels; level++) {
      index >>= 1;
      this.layers[level][index] = poseidon2([
        this.layers[level - 1][index * 2],
        index * 2 + 1 < this.layers[level - 1].length
          ? this.layers[level - 1][index * 2 + 1]
          : this.#zeros[level - 1],
      ]);
    }
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
