import { SHARED_OBJECTS, TYPES } from '@interest-protocol/blizzard-sdk';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';

import {
  blizzardSDK,
  executeTx,
  INTEREST_LABS_NODE,
  POW_9,
} from '../utils.script';

(async () => {
  const tx = new Transaction();

  const walCoin = await coinWithBalance({
    balance: POW_9,
    type: TYPES.WAL,
  })(tx);

  const { returnValues: nft } = await blizzardSDK.mintAfterVotesFinished({
    tx,
    nodeId: INTEREST_LABS_NODE,
    walCoin,
    blizzardStaking: SHARED_OBJECTS.WWAL_STAKING({
      mutable: true,
    }).objectId,
  });

  blizzardSDK.keepStakeNft({
    tx,
    nft,
  });

  await executeTx(tx);
})();
