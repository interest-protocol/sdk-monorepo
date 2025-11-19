import { poseidon } from './poseidon';

export const poseidon1 = (x: bigint) => poseidon.hash([x]);
export const poseidon2 = (x: bigint, y: bigint) => poseidon.hash([x, y]);
export const poseidon3 = (x: bigint, y: bigint, z: bigint) =>
  poseidon.hash([x, y, z]);
