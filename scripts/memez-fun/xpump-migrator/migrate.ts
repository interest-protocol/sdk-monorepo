import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';
import { suiClient } from '@interest-protocol/sui-utils';

(async () => {
  const {
    executeTx,
    network,
    pumpSdk,
    keypair,
    testnetPoolId,

    xPumpMigratorSdk,
  } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const pool = await pumpSdk.getPumpPool(testnetPoolId);

  const { tx, migrator } = await pumpSdk.migrate({
    pool: testnetPoolId,
  });

  const fee = tx.splitCoins(tx.gas, [0n]);

  const { tx: tx2, suiCoin } = await xPumpMigratorSdk.migrate({
    tx,
    migrator,
    memeCoinType: pool.memeCoinType,
    feeCoinType: SUI_TYPE_ARG,
    feeCoin: fee,
    ipxMemeCoinTreasury: pool.ipxMemeCoinTreasury,
    quoteCoinType: pool.quoteCoinType,
  });

  tx2.transferObjects([suiCoin], keypair.toSuiAddress());

  const res = await suiClient.devInspectTransactionBlock({
    transactionBlock: tx2,
    sender: keypair.toSuiAddress(),
  });

  console.log(res);
})();
