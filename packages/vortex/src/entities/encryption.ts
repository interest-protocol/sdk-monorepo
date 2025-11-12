import { blake2b } from '@noble/hashes/blake2';

import { gcm } from '@noble/ciphers/aes';
import { fromHex, toHex } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { randomBytes } from '@noble/hashes/utils';
import { VortexKeypair } from './keypair';

export interface UtxoPayload {
  amount: bigint;
  blinding: bigint;
  index: bigint;
}

export class VortexEncryption {
  encryptionKey: Uint8Array;
  utxoPrivateKey: string;
  spendingKeypair: VortexKeypair;

  constructor(keypair: VortexKeypair) {
    const privateKeyBytes = keypair.getPrivateKeyBytes();

    const message = new TextEncoder().encode(
      'Vortex encryption key derivation'
    );
    const combined = new Uint8Array(privateKeyBytes.length + message.length);
    combined.set(privateKeyBytes);
    combined.set(message, privateKeyBytes.length);
    const intermediateKey = blake2b(combined, { dkLen: 32 });

    this.encryptionKey = blake2b(intermediateKey, { dkLen: 32 });

    const hashedSeed = blake2b(this.encryptionKey, { dkLen: 32 });
    this.utxoPrivateKey = '0x' + toHex(hashedSeed);

    this.spendingKeypair = new VortexKeypair(BigInt(this.utxoPrivateKey));
  }

  encryptUtxo(utxo: UtxoPayload): Uint8Array {
    const utxoString = `${utxo.amount.toString()}|${utxo.blinding.toString()}|${utxo.index.toString()}`;
    return this.#encrypt(utxoString);
  }

  decryptUtxo(encryptedData: Uint8Array | string): UtxoPayload {
    const encryptedBuffer =
      typeof encryptedData === 'string'
        ? fromHex(encryptedData)
        : encryptedData;

    const decrypted = this.#decrypt(encryptedBuffer);
    const decryptedStr = new TextDecoder().decode(decrypted);
    const parts = decryptedStr.split('|');

    invariant(parts.length === 3, 'Invalid UTXO format after decryption');
    const [amount, blinding, index] = parts;

    return {
      amount: BigInt(amount),
      blinding: BigInt(blinding),
      index: BigInt(index),
    };
  }

  #encrypt(data: Uint8Array | string): Uint8Array {
    const dataBuffer =
      typeof data === 'string' ? new TextEncoder().encode(data) : data;

    const iv = randomBytes(12);
    const cipher = gcm(this.encryptionKey, iv);
    const encryptedData = cipher.encrypt(dataBuffer);

    const result = new Uint8Array(iv.length + encryptedData.length);
    result.set(iv, 0);
    result.set(encryptedData, iv.length);

    return result;
  }

  #decrypt(encryptedData: Uint8Array): Uint8Array {
    if (encryptedData.length < 28) {
      throw new Error('Invalid encrypted data: too short');
    }

    const iv = encryptedData.slice(0, 12);
    const data = encryptedData.slice(12);

    const decipher = gcm(this.encryptionKey, iv);

    try {
      return decipher.decrypt(data);
    } catch (error) {
      throw new Error(
        'Failed to decrypt data. Invalid encryption key or corrupted data.'
      );
    }
  }
}
