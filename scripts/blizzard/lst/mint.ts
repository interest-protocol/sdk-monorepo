import { SHARED_OBJECTS, TYPES } from '@interest-protocol/blizzard-sdk';
import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';

import { blizzardSDK, INTEREST_LABS_NODE, POW_9 } from '../utils.script';

(async () => {
  const tx = new Transaction();

  const walCoin = await coinWithBalance({
    type: TYPES.WAL,
    balance: POW_9,
  })(tx);

  const { returnValues: lst } = await blizzardSDK.mint({
    tx: tx as any,
    nodeId: INTEREST_LABS_NODE,
    walCoin,
    blizzardStaking: SHARED_OBJECTS.WWAL_STAKING({
      mutable: true,
    }).objectId,
  });

  tx.transferObjects([lst], keypair.toSuiAddress());

  await executeTx(tx);
})();
