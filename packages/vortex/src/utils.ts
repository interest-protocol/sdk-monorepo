import { poseidon2, poseidon1 } from 'poseidon-lite';
import invariant from 'tiny-invariant';

import { isValidSuiAddress, normalizeSuiAddress } from '@mysten/sui/utils';

export const BN254_FIELD_MODULUS =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;

function randomBigIntHex(byteLength: number): bigint {
  const hexString = Array.from(
    crypto.getRandomValues(new Uint8Array(byteLength))
  )
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return BigInt('0x' + hexString);
}

export const generateRandomNote = () => {
  const nullifier = randomBigIntHex(31);
  const secret = randomBigIntHex(31);
  const commitment = poseidon2([nullifier, secret]);
  return {
    nullifier,
    secret,
    commitment,
  };
};

export function bigIntToFieldElement(value: bigint) {
  return value % BN254_FIELD_MODULUS;
}

export function addressToFieldElement(address: string) {
  invariant(isValidSuiAddress(address), 'Invalid Sui address');

  const cleanAddress = normalizeSuiAddress(address, true);

  return bigIntToFieldElement(BigInt(cleanAddress));
}

export const stringToField = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let acc = 0n;
  for (const b of bytes) acc = (acc << 8n) | BigInt(b);
  return acc % BN254_FIELD_MODULUS;
};

export function zeros(treeLevels: number) {
  if (treeLevels < 1) throw new Error('treeLevels must be >= 1');

  // ZERO_VALUE := Poseidon("vortex")
  const ZERO_VALUE = poseidon1([stringToField('vortex')]);

  const zeros: bigint[] = [];

  let currentZero = ZERO_VALUE;
  zeros.push(currentZero);

  for (let i = 1; i < treeLevels; i++) {
    currentZero = poseidon2([currentZero, currentZero]);
    zeros.push(currentZero);
  }

  return zeros;
}
