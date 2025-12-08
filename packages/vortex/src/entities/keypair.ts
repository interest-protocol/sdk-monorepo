import { poseidon1, poseidon3 } from '../crypto';
import { BN254_FIELD_MODULUS, VORTEX_SIGNATURE_DOMAIN } from '../constants';

import { fromBase64, fromHex, toHex } from '@mysten/sui/utils';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import invariant from 'tiny-invariant';
import { randomBytes } from '@noble/ciphers/utils.js';
import { x25519 } from '@noble/curves/ed25519.js';
import { xsalsa20poly1305 } from '@noble/ciphers/salsa.js';
import { blake2b } from '@noble/hashes/blake2.js';
import { normalizeSuiAddress } from '@mysten/sui/utils';

export interface UtxoPayload {
  amount: bigint;
  blinding: bigint;
  index: bigint;
  vortexPool: string;
}

interface EncryptedMessage {
  version: string;
  nonce: string; // base64
  ephemPublicKey: string; // base64
  ciphertext: string; // base64
}

// Sui wallet signature function type
type SignMessageFn = (message: Uint8Array) => Promise<{
  signature: string;
  bytes: string;
}>;

function packEncryptedMessage(encryptedMessage: EncryptedMessage): string {
  const nonceBuf = Buffer.from(encryptedMessage.nonce, 'base64');
  const ephemPublicKeyBuf = Buffer.from(
    encryptedMessage.ephemPublicKey,
    'base64'
  );
  const ciphertextBuf = Buffer.from(encryptedMessage.ciphertext, 'base64');

  const messageBuff = Buffer.concat([
    Buffer.alloc(24 - nonceBuf.length),
    nonceBuf,
    Buffer.alloc(32 - ephemPublicKeyBuf.length),
    ephemPublicKeyBuf,
    ciphertextBuf,
  ]);

  return '0x' + messageBuff.toString('hex');
}

function unpackEncryptedMessage(encryptedMessage: string): EncryptedMessage {
  if (encryptedMessage.slice(0, 2) === '0x') {
    encryptedMessage = encryptedMessage.slice(2);
  }

  const messageBuff = Buffer.from(encryptedMessage, 'hex');

  const nonceBuf = messageBuff.subarray(0, 24);
  const ephemPublicKeyBuf = messageBuff.subarray(24, 56);
  const ciphertextBuf = messageBuff.subarray(56);

  return {
    version: 'x25519-xsalsa20-poly1305',
    nonce: nonceBuf.toString('base64'),
    ephemPublicKey: ephemPublicKeyBuf.toString('base64'),
    ciphertext: ciphertextBuf.toString('base64'),
  };
}

export class VortexKeypair {
  privateKey: bigint;
  publicKey: string;
  encryptionKey: string; // base64 encoded X25519 public key
  private x25519PrivateKey: Uint8Array | null;

  constructor(privateKey: bigint) {
    this.privateKey = privateKey % BN254_FIELD_MODULUS;
    this.publicKey = poseidon1(this.privateKey).toString();

    const privKeyBytes = this.#getPrivateKeyBytes();
    this.x25519PrivateKey = blake2b(privKeyBytes, { dkLen: 32 });

    invariant(
      this.x25519PrivateKey.length === 32,
      'X25519 private key must be 32 bytes'
    );

    const x25519PublicKey = x25519.getPublicKey(this.x25519PrivateKey);
    this.encryptionKey = Buffer.from(x25519PublicKey).toString('base64');
  }

  static fromSuiPrivateKey(privateKey: string): VortexKeypair {
    return new VortexKeypair(
      BigInt('0x' + toHex(fromBase64(privateKey.replace('suiprivkey', ''))))
    );
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

  static fromString(str: string): VortexKeypair {
    if (str.startsWith('0x')) {
      str = str.slice(2);
    }

    invariant(str.length === 128, 'Invalid key length');

    const keypair = Object.create(VortexKeypair.prototype);
    keypair.privateKey = null;
    keypair.x25519PrivateKey = null;
    keypair.publicKey = BigInt('0x' + str.slice(0, 64)).toString();
    keypair.encryptionKey = Buffer.from(str.slice(64, 128), 'hex').toString(
      'base64'
    );

    return keypair;
  }

  static async fromSuiWallet(
    suiAddress: string,
    signMessage: SignMessageFn
  ): Promise<VortexKeypair> {
    // Domain-separated message to prevent signature reuse
    const message = new TextEncoder().encode(
      `Generate Vortex Keypair\n\nThis signature will be used to derive your Vortex privacy keypair.\n\nAddress: ${suiAddress}\nDomain: ${VORTEX_SIGNATURE_DOMAIN}`
    );

    const { signature } = await signMessage(message);

    const signatureBytes = fromBase64(signature);
    const seed = blake2b(signatureBytes, { dkLen: 32 });

    const privateKey = BigInt('0x' + toHex(seed));

    return new VortexKeypair(privateKey);
  }

  static encryptFor(bytes: Buffer, recipientEncryptionKey: string): string {
    const ephemeralPrivateKey = randomBytes(32);
    const ephemeralPublicKey = x25519.getPublicKey(ephemeralPrivateKey);

    const recipientPublicKey = Buffer.from(recipientEncryptionKey, 'base64');

    invariant(
      recipientPublicKey.length === 32,
      'Recipient public key must be 32 bytes'
    );

    const sharedSecret = x25519.getSharedSecret(
      ephemeralPrivateKey,
      recipientPublicKey
    );

    const nonce = randomBytes(24);
    const cipher = xsalsa20poly1305(sharedSecret, nonce);
    const ciphertext = cipher.encrypt(bytes);

    const encryptedMessage: EncryptedMessage = {
      version: 'x25519-xsalsa20-poly1305',
      nonce: Buffer.from(nonce).toString('base64'),
      ephemPublicKey: Buffer.from(ephemeralPublicKey).toString('base64'),
      ciphertext: Buffer.from(ciphertext).toString('base64'),
    };

    return packEncryptedMessage(encryptedMessage);
  }

  static encryptUtxoFor(
    utxo: UtxoPayload,
    recipientEncryptionKey: string
  ): string {
    const utxoString = `${utxo.amount.toString()}|${utxo.blinding.toString()}|${utxo.index.toString()}|${utxo.vortexPool.toString()}`;
    const bytes = Buffer.from(utxoString, 'utf8');
    return VortexKeypair.encryptFor(bytes, recipientEncryptionKey);
  }

  decryptUtxo(encryptedData: string): UtxoPayload {
    const decrypted = this.#decrypt(encryptedData);
    const decryptedStr = decrypted.toString('utf8');
    const parts = decryptedStr.split('|');

    invariant(parts.length === 4, 'Invalid UTXO format after decryption');

    return {
      amount: BigInt(parts[0]),
      blinding: BigInt(parts[1]),
      index: BigInt(parts[2]),
      vortexPool: normalizeSuiAddress(parts[3]),
    };
  }

  static encryptBigIntFor(
    value: bigint,
    recipientEncryptionKey: string
  ): string {
    // Convert BigInt to hex string, then to bytes
    const hex = value.toString(16);
    const hexPadded = hex.length % 2 === 0 ? hex : '0' + hex;
    const bytes = Buffer.from(hexPadded, 'hex');
    return VortexKeypair.encryptFor(bytes, recipientEncryptionKey);
  }

  decryptBigInt(encryptedData: string): bigint {
    const decrypted = this.#decrypt(encryptedData);
    const hex = decrypted.toString('hex');
    return BigInt('0x' + hex);
  }

  sign(commitment: bigint, merklePath: bigint): bigint {
    invariant(this.privateKey !== null, 'Cannot sign without private key');
    return poseidon3(this.privateKey, commitment, merklePath);
  }

  toString(): string {
    const pubkeyHex = BigInt(this.publicKey).toString(16).padStart(64, '0');
    const encKeyHex = Buffer.from(this.encryptionKey, 'base64').toString('hex');
    return '0x' + pubkeyHex + encKeyHex;
  }

  address(): string {
    return this.toString();
  }

  #decrypt(data: string): Buffer {
    invariant(this.privateKey !== null, 'Cannot decrypt without private key');
    invariant(
      this.x25519PrivateKey !== null,
      'Cannot decrypt without X25519 private key'
    );

    const encryptedMessage = unpackEncryptedMessage(data);

    const ephemeralPublicKey = Buffer.from(
      encryptedMessage.ephemPublicKey,
      'base64'
    );

    invariant(
      ephemeralPublicKey.length === 32,
      'Ephemeral public key must be 32 bytes'
    );

    // Derive shared secret
    const sharedSecret = x25519.getSharedSecret(
      this.x25519PrivateKey,
      ephemeralPublicKey
    );

    // Decrypt using XSalsa20-Poly1305
    const nonce = Buffer.from(encryptedMessage.nonce, 'base64');
    const ciphertext = Buffer.from(encryptedMessage.ciphertext, 'base64');

    const cipher = xsalsa20poly1305(sharedSecret, nonce);
    const decrypted = cipher.decrypt(ciphertext);

    return Buffer.from(decrypted);
  }

  #getPrivateKeyBytes(): Uint8Array {
    const hex = this.privateKey.toString(16).padStart(64, '0');
    const bytes = fromHex(hex);

    // Ensure it's exactly 32 bytes
    if (bytes.length < 32) {
      const padded = new Uint8Array(32);
      padded.set(bytes, 32 - bytes.length);
      return padded;
    } else if (bytes.length > 32) {
      return bytes.slice(bytes.length - 32);
    }

    return bytes;
  }
}
