import { VortexKeypair } from './keypair';
import { poseidon3 } from 'poseidon-lite';

interface UtxoConstructorArgs {
  amount: bigint;
  blinding?: bigint;
  keypair?: VortexKeypair;
  index: bigint;
}

export class Utxo {
  amount: bigint;
  blinding: bigint;
  keypair: VortexKeypair;
  index: bigint;

  constructor({ amount, blinding, keypair, index }: UtxoConstructorArgs) {
    this.amount = amount;
    this.blinding = blinding ?? Utxo.blinding();
    this.keypair = keypair ?? VortexKeypair.generate();
    this.index = index;
  }

  static blinding() {
    return BigInt(Math.floor(Math.random() * 1_000_000_000));
  }

  commitment() {
    return poseidon3([this.amount, this.keypair.privateKey, this.blinding]);
  }

  nullifier() {
    const commitment = this.commitment();
    return poseidon3([
      commitment,
      this.index,
      this.keypair.sign(commitment, this.index),
    ]);
  }

  payload() {
    return {
      amount: this.amount,
      blinding: this.blinding,
      index: this.index,
    };
  }

  toJSON(): string {
    const utxoPayload = {
      amount: this.amount,
      blinding: this.blinding,
      keypair: this.keypair.publicKey,
      index: this.index,
      commitment: this.commitment(),
      nullifier: this.nullifier(),
      error: null,
    } as Record<string, any>;

    try {
      utxoPayload.commitment = this.commitment();
      utxoPayload.nullifier = this.nullifier();
    } catch (error) {
      utxoPayload.error = error;
    }

    return JSON.stringify(utxoPayload, null, 2);
  }
}
