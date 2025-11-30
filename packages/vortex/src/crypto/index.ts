import { poseidon, OPT } from './poseidon';

import { BN254_FIELD_MODULUS } from '../constants';

export const poseidon1 = (x: bigint) =>
  poseidon.hash([x % BN254_FIELD_MODULUS]);
export const poseidon2 = (x: bigint, y: bigint) =>
  poseidon.hash([x % BN254_FIELD_MODULUS, y % BN254_FIELD_MODULUS]);
export const poseidon3 = (x: bigint, y: bigint, z: bigint) =>
  poseidon.hash([
    x % BN254_FIELD_MODULUS,
    y % BN254_FIELD_MODULUS,
    z % BN254_FIELD_MODULUS,
  ]);
export const poseidon4 = (x: bigint, y: bigint, z: bigint, w: bigint) =>
  poseidon.hash([
    x % BN254_FIELD_MODULUS,
    y % BN254_FIELD_MODULUS,
    z % BN254_FIELD_MODULUS,
    w % BN254_FIELD_MODULUS,
  ]);

export { OPT };
