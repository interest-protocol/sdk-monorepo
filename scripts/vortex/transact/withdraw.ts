import { getEnv } from '../utils.script';
import {
  withdraw,
  emptyMerkleTree,
  getUnspentUtxos,
  parseNewCommitmentEvent,
} from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';
import { BN } from 'bn.js';

(async () => {
  try {
    const { keypair, suiClient, vortex } = await getEnv();

    const senderVortexKeypair = await VortexKeypair.fromSuiWallet(
      keypair.toSuiAddress(),
      (message) => keypair.signPersonalMessage(message)
    );

    // @dev Should come from the indexer
    const commitmentEvents = await suiClient.queryEvents({
      query: {
        MoveEventType: vortex.newCommitmentEventType,
      },
      order: 'ascending',
    });

    const parsedCommitmentEvents = parseNewCommitmentEvent(commitmentEvents);

    parsedCommitmentEvents.sort((a, b) => new BN(a.index).cmp(new BN(b.index)));

    const unspentUtxos = getUnspentUtxos(commitmentEvents, senderVortexKeypair);

    // @dev Should come from the indexer
    emptyMerkleTree.bulkInsert(
      parsedCommitmentEvents.map((event) => event.commitment)
    );

    const transaction = await withdraw({
      amount: 300n,
      vortex,
      vortexKeypair: senderVortexKeypair,
      merkleTree: emptyMerkleTree,
      recipient: keypair.toSuiAddress(),
      relayer: '0x0',
      relayerFee: 0n,
      unspentUtxos,
    });

    transaction.setSender(keypair.toSuiAddress());

    const result = await keypair.signAndExecuteTransaction({
      transaction,
      client: suiClient,
    });

    logSuccess('withdraw', result);
  } catch (error) {
    logError('withdraw', error);
  }
})();
