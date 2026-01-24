import { VortexKeypair } from './keypair';
import { poseidon3, poseidon4 } from '../crypto';
import { normalizeSuiAddress, toHex } from '@mysten/sui/utils';
import { randomBytes } from '@noble/ciphers/utils.js';
import { BN254_FIELD_MODULUS } from '../constants';

interface UtxoConstructorArgs {
  amount: bigint;
  blinding?: bigint;
  keypair?: VortexKeypair;
  index?: bigint;
  vortexPool: string;
}

interface MakeCommitmentArgs {
  amount: bigint;
  publicKey: string;
  blinding: bigint;
  vortexPool: string;
}

export class Utxo {
  amount: bigint;
  blinding: bigint;
  keypair: VortexKeypair;
  index: bigint;
  vortexPool: string;

  constructor({
    amount,
    blinding,
    keypair,
    index,
    vortexPool,
  }: UtxoConstructorArgs) {
    this.amount = amount;
    this.blinding = blinding ?? Utxo.blinding();
    this.keypair = keypair ?? VortexKeypair.generate();
    this.index = index ?? 0n;
    this.vortexPool = vortexPool;
  }

  static makeCommitment({
    amount,
    publicKey,
    blinding,
    vortexPool,
  }: MakeCommitmentArgs) {
    return poseidon4(
      amount,
      BigInt(publicKey),
      blinding,
      BigInt(normalizeSuiAddress(vortexPool, !vortexPool.startsWith('0x')))
    );
  }

  static blinding() {
    // Use cryptographically secure randomness (works on web + Node.js)
    // 31 bytes = 248 bits, safely below BN254 field modulus (~254 bits)
    const bytes = randomBytes(31);
    return BigInt('0x' + toHex(bytes)) % BN254_FIELD_MODULUS;
  }

  commitment() {
    return Utxo.makeCommitment({
      amount: this.amount,
      publicKey: this.keypair.publicKey,
      blinding: this.blinding,
      vortexPool: this.vortexPool,
    });
  }

  nullifier() {
    const commitment = this.commitment();
    return poseidon3(
      commitment,
      this.index,
      this.keypair.sign(commitment, this.index)
    );
  }

  payload() {
    return {
      amount: this.amount,
      blinding: this.blinding,
      index: this.index,
      vortexPool: this.vortexPool,
    };
  }
}
