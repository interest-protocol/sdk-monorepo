import { poseidon1, poseidon3 } from 'poseidon-lite';
import { BN254_FIELD_MODULUS } from '../constants';

import { fromBase64, fromHex, toHex } from '@mysten/sui/utils';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

import { VortexEncryptionKey } from './encryption';

export class VortexKeypair {
  publicKey: string;
  encryptionKey: VortexEncryptionKey;

  constructor(readonly privateKey: bigint) {
    this.privateKey = privateKey % BN254_FIELD_MODULUS;
    this.publicKey = poseidon1([this.privateKey]).toString();
    this.encryptionKey = VortexEncryptionKey.fromPrivateKeyBytes(
      this.getPrivateKeyBytes()
    );
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

  getPrivateKeyBytes(): Uint8Array {
    const bytes = new Uint8Array(32);
    const hex = this.privateKey.toString(16).padStart(64, '0');
    const pkBytes = fromHex(hex);
    bytes.set(pkBytes);
    return bytes;
  }
}
