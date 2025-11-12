import { poseidon1, poseidon3 } from 'poseidon-lite';
import { BN254_FIELD_MODULUS } from '../constants';

import { fromBase64, fromHex, toHex } from '@mysten/sui/utils';
import { blake2b } from '@noble/hashes/blake2.js';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export class VortexKeypair {
  publicKey: string;

  constructor(readonly privateKey: bigint) {
    this.privateKey = privateKey % BN254_FIELD_MODULUS;
    this.publicKey = poseidon1([this.privateKey]).toString();
  }

  sign(commitment: bigint, merklePath: bigint): bigint {
    return poseidon3([this.privateKey, commitment, merklePath]);
  }

  static generate(): VortexKeypair {
    const keypair = Ed25519Keypair.generate();
    return new VortexKeypair(
      BigInt(
        '0x' +
          toHex(fromBase64(keypair.getSecretKey().replace('suiprivkey', '')))
      )
    );
  }

  static fromSignature(signature: Uint8Array): VortexKeypair {
    const hash = blake2b(signature, { dkLen: 32 });
    const privateKey = Array.from(hash)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return new VortexKeypair(BigInt('0x' + privateKey));
  }

  getPrivateKeyBytes(): Uint8Array {
    const bytes = new Uint8Array(32);
    const hex = this.privateKey.toString(16).padStart(64, '0');
    const pkBytes = fromHex(hex);
    bytes.set(pkBytes);
    return bytes;
  }
}
