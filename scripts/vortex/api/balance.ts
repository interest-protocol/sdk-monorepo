import { getEnv } from '../utils.script';
import { getUnspentUtxosWithApi } from '@interest-protocol/vortex-sdk';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';

(async () => {
  try {
    const { vortexSdk, testUSDCPoolObjectId, keypair, testUSDCType, api } =
      await getEnv();

    const senderVortexKeypair = await VortexKeypair.fromSuiWallet(
      keypair.toSuiAddress(),
      (message) => keypair.signPersonalMessage(message)
    );

    const commitments = await api.getCommitments({
      coinType: testUSDCType,
      index: 0,
    });

    const unspentUtxos = await getUnspentUtxosWithApi({
      commitments: commitments.data.items,
      vortexKeypair: senderVortexKeypair,
      vortexSdk,
      vortexPool: testUSDCPoolObjectId,
    });

    logSuccess(
      'balance',
      unspentUtxos.reduce((acc, utxo) => acc + utxo.amount, 0n)
    );
  } catch (error) {
    logError('balance', error);
  }
})();
