import { getEnv } from '../utils.script';
import { logInfo } from '@interest-protocol/logger';
import invariant from 'tiny-invariant';
import { VORTEX_POOL_IDS } from '@interest-protocol/vortex-sdk';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

(async () => {
  const { VortexKeypair, Utxo } = await getEnv();

  // Generate keypair for jose
  const joseVortexKeypair = VortexKeypair.generate();

  // Death wants to send 123 Sui to Jose
  const utxoData = {
    amount: 123n,
    index: 7n,
    blinding: Utxo.blinding(),
    vortexPool: VORTEX_POOL_IDS[SUI_TYPE_ARG],
  };

  // Death needs to encrypt the UTXO for Jose using his public key

  const encryptedUtxo = VortexKeypair.encryptUtxoFor(
    utxoData,
    joseVortexKeypair.encryptionKey
  );

  logInfo('encryptedUtxo', encryptedUtxo, '\n');

  const decryptedUtxo = joseVortexKeypair.decryptUtxo(encryptedUtxo);

  invariant(decryptedUtxo.amount === utxoData.amount, 'amount mismatch');
  invariant(decryptedUtxo.blinding === utxoData.blinding, 'blinding mismatch');
  invariant(decryptedUtxo.index === utxoData.index, 'index mismatch');

  logInfo('decryptedUtxo', decryptedUtxo, '\n');

  try {
    VortexKeypair.generate().decryptUtxo(encryptedUtxo);
  } catch {
    logInfo('unauthorized decryption should fail', '\n');
  }
})();
