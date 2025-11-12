import { getEnv } from '../utils.script';
import { logInfo } from '@interest-protocol/logger';
import { toHex } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

(async () => {
  const { encryption, vortexKeypair, Utxo } = await getEnv();

  const utxo = new Utxo({
    amount: 12345n,
    index: 7n,
    keypair: vortexKeypair,
  });

  const encryptedUtxo = encryption.encryptUtxo(utxo.payload());

  logInfo('encryptedUtxo', toHex(encryptedUtxo));

  const decryptedUtxo = encryption.decryptUtxo(encryptedUtxo);

  invariant(decryptedUtxo.amount === utxo.amount, 'amount mismatch');
  invariant(decryptedUtxo.blinding === utxo.blinding, 'blinding mismatch');
  invariant(decryptedUtxo.index === utxo.index, 'index mismatch');

  logInfo('decryptedUtxo', decryptedUtxo);
})();
