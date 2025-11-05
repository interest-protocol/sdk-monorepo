import { poseidon1 } from 'poseidon-lite';
import { logSuccess } from '@interest-protocol/logger';
import { zeros } from '@interest-protocol/vortex-sdk';

export const BN254_FIELD_MODULUS =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;

export const stringToField = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let acc = 0n;
  for (const b of bytes) acc = (acc << 8n) | BigInt(b);
  return acc;
};

(() => {
  logSuccess(
    'zero',
    poseidon1([stringToField('vortex')]) % BN254_FIELD_MODULUS
  );
  console.log(zeros(32));
})();
