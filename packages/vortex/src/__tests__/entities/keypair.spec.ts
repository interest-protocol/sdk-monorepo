import { VortexKeypair } from '../../entities/keypair';
import { BN254_FIELD_MODULUS } from '../../constants';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

describe(VortexKeypair.name, () => {
  describe('generate', () => {
    it('should generate a valid keypair', () => {
      const keypair = VortexKeypair.generate();

      expect(keypair.privateKey).toBeDefined();
      expect(keypair.publicKey).toBeDefined();
      expect(keypair.encryptionKey).toBeDefined();
      expect(typeof keypair.publicKey).toBe('string');
    });

    it('should generate different keypairs each time', () => {
      const keypair1 = VortexKeypair.generate();
      const keypair2 = VortexKeypair.generate();

      expect(keypair1.privateKey).not.toBe(keypair2.privateKey);
      expect(keypair1.publicKey).not.toBe(keypair2.publicKey);
    });

    it('should ensure private key is within BN254 field', () => {
      const keypair = VortexKeypair.generate();
      expect(keypair.privateKey).toBeLessThanOrEqual(BN254_FIELD_MODULUS);
    });
  });

  describe('fromString', () => {
    it('should create keypair from string', () => {
      const keypair = VortexKeypair.generate();
      const keypairString = keypair.toString();
      const restoredKeypair = VortexKeypair.fromString(keypairString);

      expect(restoredKeypair.publicKey).toBe(keypair.publicKey);
      expect(restoredKeypair.encryptionKey).toBe(keypair.encryptionKey);
    });

    it('should handle 0x prefix', () => {
      const keypair = VortexKeypair.generate();
      const withPrefix = keypair.toString();
      const withoutPrefix = withPrefix.slice(2);

      const keypair1 = VortexKeypair.fromString(withPrefix);
      const keypair2 = VortexKeypair.fromString(withoutPrefix);

      expect(keypair1.publicKey).toBe(keypair2.publicKey);
    });
  });

  describe('sign', () => {
    it('should produce consistent signatures', () => {
      const keypair = VortexKeypair.generate();
      const commitment = 123n;
      const merklePath = 456n;

      const sig1 = keypair.sign(commitment, merklePath);
      const sig2 = keypair.sign(commitment, merklePath);

      expect(sig1).toBe(sig2);
    });

    it('should produce different signatures for different inputs', () => {
      const keypair = VortexKeypair.generate();

      const sig1 = keypair.sign(123n, 456n);
      const sig2 = keypair.sign(789n, 456n);

      expect(sig1).not.toBe(sig2);
    });
  });

  describe('encryption/decryption', () => {
    it('should encrypt and decrypt UTXO data', () => {
      const keypair = VortexKeypair.generate();
      const utxo = {
        amount: 1000n,
        blinding: 999n,
        index: 5n,
        vortexPool: '0x123',
      };

      const encrypted = VortexKeypair.encryptUtxoFor(
        utxo,
        keypair.encryptionKey
      );
      const decrypted = keypair.decryptUtxo(encrypted);

      expect(decrypted.amount).toBe(utxo.amount);
      expect(decrypted.blinding).toBe(utxo.blinding);
      expect(decrypted.index).toBe(utxo.index);
    });

    it('should fail to decrypt with wrong keypair', () => {
      const keypair1 = VortexKeypair.generate();
      const keypair2 = VortexKeypair.generate();

      const utxo = {
        amount: 1000n,
        blinding: 999n,
        index: 5n,
        vortexPool: '0x123',
      };

      const encrypted = VortexKeypair.encryptUtxoFor(
        utxo,
        keypair1.encryptionKey
      );

      // Attempting to decrypt with wrong keypair should throw
      expect(() => keypair2.decryptUtxo(encrypted)).toThrow(
        'Decryption failed: HMAC verification failed'
      );
    });

    it('should ALWAYS fail with wrong keypair - 100 iterations', () => {
      // This test verifies the key-committing property of HMAC
      // With the old Poly1305, this could sometimes succeed with garbage data
      // With HMAC-SHA256, it should ALWAYS fail

      const correctKeypair = VortexKeypair.generate();
      const utxo = {
        amount: 1000000n,
        blinding: 123456789n,
        index: 42n,
        vortexPool:
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      };

      const encrypted = VortexKeypair.encryptUtxoFor(
        utxo,
        correctKeypair.encryptionKey
      );

      let failureCount = 0;
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const wrongKeypair = VortexKeypair.generate();
        try {
          wrongKeypair.decryptUtxo(encrypted);
          // If we get here, decryption "succeeded" (BUG!)
        } catch {
          failureCount++;
        }
      }

      // ALL attempts must fail - this proves the key-committing property
      expect(failureCount).toBe(iterations);
    });

    it('should throw specific HMAC error message on wrong key', () => {
      const keypair1 = VortexKeypair.generate();
      const keypair2 = VortexKeypair.generate();

      const utxo = {
        amount: 500n,
        blinding: 12345n,
        index: 1n,
        vortexPool: '0xabc',
      };

      const encrypted = VortexKeypair.encryptUtxoFor(
        utxo,
        keypair1.encryptionKey
      );

      expect(() => keypair2.decryptUtxo(encrypted)).toThrow(
        'HMAC verification failed'
      );
    });

    it('should decrypt correctly with the right keypair after failed attempts', () => {
      const correctKeypair = VortexKeypair.generate();
      const utxo = {
        amount: 9999n,
        blinding: 8888n,
        index: 7n,
        vortexPool: '0xdef',
      };

      const encrypted = VortexKeypair.encryptUtxoFor(
        utxo,
        correctKeypair.encryptionKey
      );

      // Try 10 wrong keypairs first
      for (let i = 0; i < 10; i++) {
        const wrongKeypair = VortexKeypair.generate();
        expect(() => wrongKeypair.decryptUtxo(encrypted)).toThrow();
      }

      // Now decrypt with correct keypair - should still work
      const decrypted = correctKeypair.decryptUtxo(encrypted);
      expect(decrypted.amount).toBe(utxo.amount);
      expect(decrypted.blinding).toBe(utxo.blinding);
      expect(decrypted.index).toBe(utxo.index);
    });

    it('should handle large amounts correctly', () => {
      const keypair = VortexKeypair.generate();
      const utxo = {
        amount: BigInt('999999999999999999999999999'),
        blinding: BigInt('888888888888888888888888888'),
        index: BigInt('77777777777'),
        vortexPool:
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      };

      const encrypted = VortexKeypair.encryptUtxoFor(
        utxo,
        keypair.encryptionKey
      );
      const decrypted = keypair.decryptUtxo(encrypted);

      expect(decrypted.amount).toBe(utxo.amount);
      expect(decrypted.blinding).toBe(utxo.blinding);
      expect(decrypted.index).toBe(utxo.index);
    });

    it('should handle zero values correctly', () => {
      const keypair = VortexKeypair.generate();
      const utxo = {
        amount: 0n,
        blinding: 0n,
        index: 0n,
        vortexPool: '0x0',
      };

      const encrypted = VortexKeypair.encryptUtxoFor(
        utxo,
        keypair.encryptionKey
      );
      const decrypted = keypair.decryptUtxo(encrypted);

      expect(decrypted.amount).toBe(utxo.amount);
      expect(decrypted.blinding).toBe(utxo.blinding);
      expect(decrypted.index).toBe(utxo.index);
    });

    it('should produce different ciphertexts for same data (random nonce)', () => {
      const keypair = VortexKeypair.generate();
      const utxo = {
        amount: 1000n,
        blinding: 999n,
        index: 5n,
        vortexPool: '0x123',
      };

      const encrypted1 = VortexKeypair.encryptUtxoFor(
        utxo,
        keypair.encryptionKey
      );
      const encrypted2 = VortexKeypair.encryptUtxoFor(
        utxo,
        keypair.encryptionKey
      );

      // Different ciphertexts due to random nonce
      expect(encrypted1).not.toBe(encrypted2);

      // But both decrypt to same data
      const decrypted1 = keypair.decryptUtxo(encrypted1);
      const decrypted2 = keypair.decryptUtxo(encrypted2);

      expect(decrypted1.amount).toBe(decrypted2.amount);
      expect(decrypted1.blinding).toBe(decrypted2.blinding);
      expect(decrypted1.index).toBe(decrypted2.index);
    });
  });

  describe('BigInt encryption/decryption', () => {
    it('should encrypt and decrypt a BigInt value', () => {
      const keypair = VortexKeypair.generate();
      const originalValue = 123456n;

      const encrypted = VortexKeypair.encryptBigIntFor(
        originalValue,
        keypair.encryptionKey
      );
      const decrypted = keypair.decryptBigInt(encrypted);

      expect(decrypted).toBe(originalValue);
    });

    it('should handle zero', () => {
      const keypair = VortexKeypair.generate();
      const originalValue = 0n;

      const encrypted = VortexKeypair.encryptBigIntFor(
        originalValue,
        keypair.encryptionKey
      );
      const decrypted = keypair.decryptBigInt(encrypted);

      expect(decrypted).toBe(originalValue);
    });

    it('should handle large BigInt values', () => {
      const keypair = VortexKeypair.generate();
      const originalValue = BigInt(
        '21888242871839275222246405745257275088548364400416034343698204186575808495616'
      );

      const encrypted = VortexKeypair.encryptBigIntFor(
        originalValue,
        keypair.encryptionKey
      );
      const decrypted = keypair.decryptBigInt(encrypted);

      expect(decrypted).toBe(originalValue);
    });

    it('should fail to decrypt with wrong keypair', () => {
      const keypair1 = VortexKeypair.generate();
      const keypair2 = VortexKeypair.generate();
      const originalValue = 123456n;

      const encrypted = VortexKeypair.encryptBigIntFor(
        originalValue,
        keypair1.encryptionKey
      );

      expect(() => keypair2.decryptBigInt(encrypted)).toThrow(
        'Decryption failed: HMAC verification failed'
      );
    });

    it('should produce different ciphertexts for same value (random nonce)', () => {
      const keypair = VortexKeypair.generate();
      const value = 999999n;

      const encrypted1 = VortexKeypair.encryptBigIntFor(
        value,
        keypair.encryptionKey
      );
      const encrypted2 = VortexKeypair.encryptBigIntFor(
        value,
        keypair.encryptionKey
      );

      expect(encrypted1).not.toBe(encrypted2);

      // But both decrypt to the same value
      expect(keypair.decryptBigInt(encrypted1)).toBe(value);
      expect(keypair.decryptBigInt(encrypted2)).toBe(value);
    });

    it('should ALWAYS fail with wrong keypair - 100 iterations', () => {
      const correctKeypair = VortexKeypair.generate();
      const value = BigInt('12345678901234567890');

      const encrypted = VortexKeypair.encryptBigIntFor(
        value,
        correctKeypair.encryptionKey
      );

      let failureCount = 0;
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const wrongKeypair = VortexKeypair.generate();
        try {
          wrongKeypair.decryptBigInt(encrypted);
        } catch {
          failureCount++;
        }
      }

      expect(failureCount).toBe(iterations);
    });
  });

  describe('toString/address', () => {
    it('should produce consistent string representation', () => {
      const keypair = VortexKeypair.generate();
      const str1 = keypair.toString();
      const str2 = keypair.toString();

      expect(str1).toBe(str2);
    });

    it('should start with 0x', () => {
      const keypair = VortexKeypair.generate();
      expect(keypair.toString()).toMatch(/^0x/);
    });

    it('address should match toString', () => {
      const keypair = VortexKeypair.generate();
      expect(keypair.address()).toBe(keypair.toString());
    });
  });

  describe('fromSuiWallet', () => {
    it('should create keypair from Sui wallet', async () => {
      const suiWallet = Ed25519Keypair.generate();

      const keypair = await VortexKeypair.fromSuiWallet(
        suiWallet.toSuiAddress(),
        async (message) => suiWallet.signPersonalMessage(message)
      );

      expect(keypair.publicKey).toBeDefined();
      expect(keypair.encryptionKey).toBeDefined();
      expect(keypair.privateKey).toBeDefined();
      expect(typeof keypair.privateKey).toBe('bigint');
      expect(typeof keypair.publicKey).toBe('string');
      expect(typeof keypair.encryptionKey).toBe('string');
      expect(keypair.privateKey).toBeLessThanOrEqual(BN254_FIELD_MODULUS);
    });

    it('should recreate the same keypair from the same Sui wallet', async () => {
      const suiWallet = Ed25519Keypair.generate();
      const keypair = await VortexKeypair.fromSuiWallet(
        suiWallet.toSuiAddress(),
        async (message) => suiWallet.signPersonalMessage(message)
      );

      const keypair2 = await VortexKeypair.fromSuiWallet(
        suiWallet.toSuiAddress(),
        async (message) => suiWallet.signPersonalMessage(message)
      );

      expect(keypair.publicKey).toBe(keypair2.publicKey);
      expect(keypair.encryptionKey).toBe(keypair2.encryptionKey);
      expect(keypair.privateKey).toBe(keypair2.privateKey);
      expect(keypair.address()).toBe(keypair2.address());
      expect(keypair.toString()).toBe(keypair2.toString());
    });

    it('should create a different keypair for a different Sui wallet', async () => {
      const suiWallet1 = Ed25519Keypair.generate();
      const suiWallet2 = Ed25519Keypair.generate();

      const keypair1 = await VortexKeypair.fromSuiWallet(
        suiWallet1.toSuiAddress(),
        async (message) => suiWallet1.signPersonalMessage(message)
      );
      const keypair2 = await VortexKeypair.fromSuiWallet(
        suiWallet2.toSuiAddress(),
        async (message) => suiWallet2.signPersonalMessage(message)
      );

      expect(keypair1.publicKey).not.toBe(keypair2.publicKey);
      expect(keypair1.encryptionKey).not.toBe(keypair2.encryptionKey);
      expect(keypair1.privateKey).not.toBe(keypair2.privateKey);
      expect(keypair1.address()).not.toBe(keypair2.address());
      expect(keypair1.toString()).not.toBe(keypair2.toString());
    });
  });
});
