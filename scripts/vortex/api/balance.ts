import { getEnv } from '../utils.script';
import { getUnspentUtxosWithApi } from '@interest-protocol/vortex-sdk';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

(async () => {
  try {
    const { vortexSdk, suiVortexPoolObjectId, keypair, api } = await getEnv();

    const senderVortexKeypair = await VortexKeypair.fromSuiWallet(
      keypair.toSuiAddress(),
      (message) => keypair.signPersonalMessage(message)
    );

    const commitments = await api.getCommitments({
      coinType: SUI_TYPE_ARG,
      index: 0,
      limit: 100,
    });

    const unspentUtxos = await getUnspentUtxosWithApi({
      commitments: commitments.data.items,
      vortexKeypair: senderVortexKeypair,
      vortexSdk,
      vortexPool: suiVortexPoolObjectId,
    });

    logSuccess(
      'balance',
      unspentUtxos.reduce((acc, utxo) => acc + utxo.amount, 0n)
    );
  } catch (error) {
    logError('balance', error);
  }
})();
