import { SuiClient } from '@mysten/sui/client';
import { Vortex } from '@interest-protocol/vortex-sdk';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';
import { BN } from 'bn.js';
import { parseNewCommitmentEvent } from '@interest-protocol/vortex-sdk';

import {
  buildMerkleTree,
  getUnspentUtxos,
} from '@interest-protocol/vortex-sdk';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

interface GetUnspentUtxosAndMerkleTreeArgs {
  suiClient: SuiClient;
  vortexSdk: Vortex;
  suiVortexPoolObjectId: string;
  senderVortexKeypair: VortexKeypair;
  coinType?: string;
}

interface GetParsedCommitmentEventsArgs {
  suiClient: SuiClient;
  vortexSdk: Vortex;
  coinType?: string;
}

export const getParsedCommitmentEvents = async ({
  suiClient,
  vortexSdk,
  coinType = SUI_TYPE_ARG,
}: GetParsedCommitmentEventsArgs) => {
  const commitmentEvents = await suiClient.queryEvents({
    query: {
      MoveEventType: vortexSdk.getNewCommitmentEvent(coinType),
    },
  });

  return parseNewCommitmentEvent(commitmentEvents);
};

export const getUnspentUtxosAndMerkleTree = async ({
  suiClient,
  vortexSdk,
  senderVortexKeypair,
  suiVortexPoolObjectId,
  coinType = SUI_TYPE_ARG,
}: GetUnspentUtxosAndMerkleTreeArgs) => {
  // @dev Should come from the indexer
  const commitmentEvents = await suiClient.queryEvents({
    query: {
      MoveEventType: vortexSdk.getNewCommitmentEvent(coinType),
    },
    order: 'ascending',
  });

  const parsedCommitmentEvents = parseNewCommitmentEvent(commitmentEvents);

  const merkleTree = buildMerkleTree();

  parsedCommitmentEvents.sort((a, b) => new BN(a.index).cmp(new BN(b.index)));

  const vortexPool = await vortexSdk.getVortexPool(suiVortexPoolObjectId);

  const unspentUtxos = await getUnspentUtxos({
    commitmentEvents,
    vortexKeypair: senderVortexKeypair,
    vortexSdk,
    vortexPool,
  });

  // @dev Should come from the indexer
  merkleTree.bulkInsert(
    parsedCommitmentEvents.map((event) => event.commitment.toString())
  );

  return {
    unspentUtxos: unspentUtxos.filter((utxo) => utxo.amount > 0n),
    merkleTree,
  };
};
