import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

(async () => {
  const {
    executeTx,
    network,
    pumpSdk,
    keypair,
    testnetPoolId,
    xPumpMigratorSdk,
    suiClient,
    fakeSuiTypeArg,
  } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const pool = await pumpSdk.getPumpPool(testnetPoolId);

  const { tx, migrator } = await pumpSdk.migrate({
    pool: testnetPoolId,
  });

  const fee = tx.splitCoins(tx.gas, [0n]);

  const fakeSuiMetadata = await suiClient.getCoinMetadata({
    coinType: fakeSuiTypeArg,
  });

  const { tx: tx2, suiCoin } = await xPumpMigratorSdk.migrate({
    tx,
    migrator,
    feeCoinType: SUI_TYPE_ARG,
    feeCoin: fee,
    ipxMemeCoinTreasury: pool.ipxMemeCoinTreasury,
    memeCoinType: pool.memeCoinType,
    quoteCoinType: pool.quoteCoinType,
    quoteMetadataId: fakeSuiMetadata!.id!,
  });

  tx2.transferObjects([suiCoin], keypair.toSuiAddress());

  await executeTx(tx2);
})();
