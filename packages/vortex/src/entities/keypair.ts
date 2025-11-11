import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { poseidon1, poseidon3 } from 'poseidon-lite';
import { BN254_FIELD_MODULUS } from '../constants';
import BigNumber from 'bignumber.js';

export class VortexKeypair {
  publicKey: bigint;

  constructor(readonly privateKey: bigint) {
    this.privateKey = privateKey % BN254_FIELD_MODULUS;
    this.publicKey = poseidon1([this.privateKey]);
  }

  sign(commitment: bigint, merklePath: bigint): bigint {
    return poseidon3([this.privateKey, commitment, merklePath]);
  }

  static generate(): VortexKeypair {
    const keypair = Ed25519Keypair.generate();
    return new VortexKeypair(
      BigInt(new BigNumber(keypair.getSecretKey()).integerValue().toString())
    );
  }
}
