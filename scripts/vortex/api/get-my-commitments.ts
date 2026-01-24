import { getEnv } from '../utils.script';

import { logError } from '@interest-protocol/logger';
import { SUI_TYPE_ARG, toHex } from '@mysten/sui/utils';

(async () => {
  try {
    const { api, VortexKeypair, keypair, apiKey } = await getEnv();

    const senderVortexKeypair = await VortexKeypair.fromSuiWallet(
      keypair.toSuiAddress(),
      (message) => keypair.signPersonalMessage(message)
    );

    const commitments = await api.getAllCommitments({
      coinType: SUI_TYPE_ARG,
      index: 0,
      op: 'gte',
      apiKey,
    });

    console.log(commitments.length);

    const utxos = [] as unknown[];

    commitments.forEach((commitment) => {
      try {
        const utxo = senderVortexKeypair.decryptUtxo(
          toHex(Uint8Array.from(commitment.encryptedOutput))
        );

        utxos.push(utxo);
      } catch (e) {
        console.log('not my utxo', e);
      }
    });

    console.log(utxos);
  } catch (error) {
    logError('balance', error);
  }
})();
