import { getEnv } from '../utils.script';
import { logInfo } from '@interest-protocol/logger';
import invariant from 'tiny-invariant';

(async () => {
  const { VortexKeypair, Utxo } = await getEnv();

  // Generate keypair for jose
  const joseVortexKeypair = VortexKeypair.generate();

  // Death wants to send 123 Sui to Jose
  const utxoData = {
    amount: 123n,
    index: 7n,
    blinding: Utxo.blinding(),
  };

  // Death needs to encrypt the UTXO for Jose using his public key

  const encryptedUtxo = VortexKeypair.encryptUtxoFor(
    utxoData,
    joseVortexKeypair.encryptionKey
  );

  logInfo('encryptedUtxo', encryptedUtxo);

  const decryptedUtxo = joseVortexKeypair.decryptUtxo(encryptedUtxo);

  invariant(decryptedUtxo.amount === utxoData.amount, 'amount mismatch');
  invariant(decryptedUtxo.blinding === utxoData.blinding, 'blinding mismatch');
  invariant(decryptedUtxo.index === utxoData.index, 'index mismatch');

  logInfo('decryptedUtxo', decryptedUtxo);

  const attackerKeyPair = VortexKeypair.generate();

  try {
    attackerKeyPair.decryptUtxo(encryptedUtxo);
  } catch {
    console.log('attacker decrypted utxo should fail');
  }
})();
