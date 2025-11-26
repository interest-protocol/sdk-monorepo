import { SuiClient } from '@mysten/sui/client';
import { Vortex } from '@interest-protocol/vortex-sdk';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';
import { BN } from 'bn.js';
import { parseNewCommitmentEvent } from '@interest-protocol/vortex-sdk';

import {
  MERKLE_TREE_HEIGHT,
  MerkleTree,
  getUnspentUtxos,
} from '@interest-protocol/vortex-sdk';

interface GetUnspentUtxosAndMerkleTreeArgs {
  suiClient: SuiClient;
  vortex: Vortex;
  senderVortexKeypair: VortexKeypair;
}

interface GetParsedCommitmentEventsArgs {
  suiClient: SuiClient;
  vortex: Vortex;
}

export const getParsedCommitmentEvents = async ({
  suiClient,
  vortex,
}: GetParsedCommitmentEventsArgs) => {
  const commitmentEvents = await suiClient.queryEvents({
    query: {
      MoveEventType: vortex.newCommitmentEventType,
    },
  });

  return parseNewCommitmentEvent(commitmentEvents);
};

export const getUnspentUtxosAndMerkleTree = async ({
  suiClient,
  vortex,
  senderVortexKeypair,
}: GetUnspentUtxosAndMerkleTreeArgs) => {
  // @dev Should come from the indexer
  const commitmentEvents = await suiClient.queryEvents({
    query: {
      MoveEventType: vortex.newCommitmentEventType,
    },
    order: 'ascending',
  });

  const parsedCommitmentEvents = parseNewCommitmentEvent(commitmentEvents);

  const merkleTree = new MerkleTree(MERKLE_TREE_HEIGHT);

  parsedCommitmentEvents.sort((a, b) => new BN(a.index).cmp(new BN(b.index)));

  const unspentUtxos = await getUnspentUtxos({
    commitmentEvents,
    senderVortexKeypair,
    vortex,
  });

  // @dev Should come from the indexer
  merkleTree.bulkInsert(
    parsedCommitmentEvents.map((event) => event.commitment)
  );

  return { unspentUtxos, merkleTree };
};
