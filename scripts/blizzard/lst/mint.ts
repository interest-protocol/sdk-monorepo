import { SHARED_OBJECTS, TYPES } from '@interest-protocol/blizzard-sdk';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';

import {
  blizzardSDK,
  executeTx,
  INTEREST_LABS_NODE,
  keypair,
  POW_9,
} from '../utils.script';

(async () => {
  const tx = new Transaction();

  const walCoin = await coinWithBalance({
    type: TYPES.WAL,
    balance: POW_9 * 1n,
  })(tx);

  const { returnValues: lst } = await blizzardSDK.mint({
    tx,
    nodeId: INTEREST_LABS_NODE,
    walCoin,
    blizzardStaking: SHARED_OBJECTS.PWAL_STAKING({
      mutable: true,
    }).objectId,
  });

  tx.transferObjects([lst], keypair.toSuiAddress());

  await executeTx(tx);
})();
