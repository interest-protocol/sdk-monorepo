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
      };

      const encrypted = VortexKeypair.encryptUtxoFor(
        utxo,
        keypair1.encryptionKey
      );

      // Attempting to decrypt with wrong keypair should throw or produce garbage
      expect(() => keypair2.decryptUtxo(encrypted)).toThrow();
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
